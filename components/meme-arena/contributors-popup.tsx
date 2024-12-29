import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MemeContributionData } from "@/types"

interface ContributorsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributorsPopup: React.FC<ContributorsPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contributors</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
        </div>
      </DialogContent>
    </Dialog>
  )
}