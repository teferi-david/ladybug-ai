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
          <DialogTitle>Try Pro free</DialogTitle>
          <DialogDescription>
            {message ||
              "You have used your free humanizer runs for today. Grab a 1-day free trial for unlimited AI Humanizer, Paraphraser, Citations, and the rest of Pro. If you still like us after that, annual billing kicks in."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-4 sm:flex-row sm:gap-3">
          <ProUpgradeButton asChild className="w-full sm:min-w-[200px]">
            <Link href="/pricing">Start for free</Link>
          </ProUpgradeButton>
          <Button variant="outline" onClick={onClose} className="w-full min-h-11 rounded-xl sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

