import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { ImageIcon, StoreIcon } from 'lucide-react'
import { Label } from './label'
import { StoreCardProps } from '@/types/type'
import { Skeleton } from './skeleton'

export default function StoreCard({
  name,
  coverPhoto,
  profilePhoto,
  buttonClick,
  isLoading,
}: StoreCardProps) {
  return (
    <Card
      className="flex flex-col h-full overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
      onClick={buttonClick}
    >
      {isLoading ? (
        <Skeleton className="w-full h-[160px] rounded-t-[14px]" />
      ) : (
        <>
          {coverPhoto ? (
            <div className="relative w-full h-[160px] overflow-hidden bg-gray-50 border-b border-gray-100">
              <Image
                src={coverPhoto}
                alt={`${name || 'Store'} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          ) : (
            <div className="w-full h-[160px] flex items-center justify-center bg-[#F5F5F7] border-b border-gray-100">
              <ImageIcon className="h-6 w-6 text-[#111111]/40" />
            </div>
          )}
        </>
      )}

      <CardContent className="p-4 flex flex-row gap-3 items-center">
        {isLoading ? (
          <div className="flex flex-row gap-3 w-full items-center">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ) : (
          <>
            <Avatar className="h-9 w-9 border border-gray-100 shrink-0">
              <AvatarImage src={profilePhoto} className="object-cover" />
              <AvatarFallback className="bg-[#F5F5F7]">
                <StoreIcon className="h-4 w-4 text-[#111111]" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-[14px] font-semibold text-[#1F2937] truncate">
              {name || 'Unnamed Store'}
            </CardTitle>
          </>
        )}
      </CardContent>
    </Card>
  )
}
