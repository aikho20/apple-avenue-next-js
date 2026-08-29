import Store from '@/app/store/page'
export default function ShopPage({ searchParams }: { searchParams: { storeId?: string; search?: string } }) {
  return <Store searchParams={searchParams} />
}
