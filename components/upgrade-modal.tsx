'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProUpgradeButton } from '@/components/pro-upgrade-button'
import Link from 'next/link'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  message?: string
}

export function UpgradeModal({ open, onClose, message }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            {message ||
              "You've used your 2 free humanizer runs for today. Upgrade to Pro for unlimited humanizing and all tools."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-4 sm:flex-row sm:gap-3">
          <ProUpgradeButton asChild className="w-full sm:min-w-[200px]">
            <Link href="/pricing">Upgrade to unlock</Link>
          </ProUpgradeButton>
          <Button variant="outline" onClick={onClose} className="w-full min-h-11 rounded-xl sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

