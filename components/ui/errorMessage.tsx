import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { Button } from './button'
import { useRouter } from 'next/navigation'

export default function ErrorMessage() {
  const router = useRouter()
  return (
    <div className='min-h-[90vh] w-full flex justify-center items-center flex-1'>
      <Card className='bg-white flex flex-col max-h-sm max-w-[300px] rounded-lg hover:shadow-md transition duration-300 border'>
        <CardHeader className='relative bg-slate-100 flex flex-row'>
          <Info className='h-6 w-6 mx-2 text-primary' /> Something went wrong!
        </CardHeader>
        <CardContent className='p-4 '>
          <p className='text-sm mb-3'>Please Try Again!</p>
          <div className='flex flex-row space-x-3 justify-end'>
            <Button
              onClick={() => {
                router.refresh()
              }}
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                router.back()
              }}
              variant={'outline'}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
