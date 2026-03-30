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
              "You've used your free Ladybug AI trials for today. Start your 3-day trial for just $1.49 to get unlimited access to all our AI tools!"}
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

