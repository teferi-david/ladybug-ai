import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BillingReturnPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-background">
      <Card className="w-full max-w-md dark:border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Return to LadyBug AI</CardTitle>
          <CardDescription>
            You have left the billing portal. Your subscription settings are saved with Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/settings?from=billing">Continue to settings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
