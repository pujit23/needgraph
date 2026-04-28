import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, Users, PackageOpen, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface CollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
  ngo: any;
}

type CollabType = 'assign_task' | 'request_resource' | 'offer_help';

export default function CollaborateModal({ isOpen, onClose, ngo }: CollaborateModalProps) {
  const [collabType, setCollabType] = useState<CollabType>('assign_task');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [resourceType, setResourceType] = useState('');

  if (!isOpen || !ngo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !ward.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Collaboration request sent to ${ngo.name}!`);
    setTimeout(() => {
      onClose();
      // Reset form
      setCollabType('assign_task');
      setDescription('');
      setWard('');
      setUrgency('medium');
      setResourceType('');
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#111118] border border-[#1E1E2E] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
            <div>
              <h2 className="text-lg font-semibold text-[#F0F0F5] flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#6C63FF]" />
                Collaborate
              </h2>
              <p className="text-sm text-[#8A8A9A] mt-1">with {ngo.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#8A8A9A] hover:text-[#F0F0F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 overflow-y-auto">
            <form id="collabForm" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-medium text-[#8A8A9A] uppercase tracking-wider mb-3">
                  Collaboration Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCollabType('assign_task')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                      collabType === 'assign_task'
                        ? 'bg-[#6C63FF]/10 border-[#6C63FF] text-[#6C63FF]'
                        : 'bg-[#0A0A0F] border-[#1E1E2E] text-[#8A8A9A] hover:border-[#2A2A40]'
                    }`}
                  >
                    <Users className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">Assign Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollabType('request_resource')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                      collabType === 'request_resource'
                        ? 'bg-[#6C63FF]/10 border-[#6C63FF] text-[#6C63FF]'
                        : 'bg-[#0A0A0F] border-[#1E1E2E] text-[#8A8A9A] hover:border-[#2A2A40]'
                    }`}
                  >
                    <PackageOpen className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">Request Resources</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollabType('offer_help')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                      collabType === 'offer_help'
                        ? 'bg-[#6C63FF]/10 border-[#6C63FF] text-[#6C63FF]'
                        : 'bg-[#0A0A0F] border-[#1E1E2E] text-[#8A8A9A] hover:border-[#2A2A40]'
                    }`}
                  >
                    <Handshake className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">Offer Help</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-4">
                {collabType === 'request_resource' && (
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF] transition-colors"
                      required
                    >
                      <option value="">Select resource type...</option>
                      <option value="Medical Supplies">Medical Supplies</option>
                      <option value="Food & Water">Food & Water</option>
                      <option value="Shelter">Shelter Materials</option>
                      <option value="Transport">Transport Vehicle</option>
                      <option value="Personnel">Specialized Personnel</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                      Target Ward <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF] transition-colors"
                      required
                    >
                      <option value="">Select ward...</option>
                      {ngo.wards?.map((w: number) => (
                        <option key={w} value={w.toString()}>Ward {w}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                      Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-2.5 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF] transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                    Description / Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-4 py-3 text-sm text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF] transition-colors resize-none placeholder-[#55556A]"
                    placeholder={
                      collabType === 'assign_task'
                        ? 'Describe the task requirements and goals...'
                        : collabType === 'request_resource'
                        ? 'Specify quantity and specific requirements...'
                        : 'How can your team or resources assist them?'
                    }
                    required
                  />
                </div>

                <div className="bg-[#0A0A0F] p-3 rounded-lg border border-[#1E1E2E] flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#8A8A9A] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#8A8A9A] leading-relaxed">
                    This request will be sent to the {ngo.name} coordination team. You will be notified when they accept or respond to your request.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#1E1E2E] bg-[#0A0A0F]/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#F0F0F5] hover:bg-[#1E1E2E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="collabForm"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors flex items-center gap-2"
            >
              Send Request
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
