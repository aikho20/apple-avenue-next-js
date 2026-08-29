export default function ContactUsPage() {
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <h1 className="text-[20px] font-bold text-[#1D1D1F]">Contact Us — Apple Avenue</h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">Premium support — authentic devices, warranty, delivery. We reply within 24h.</p>
        <div className="mt-6 rounded-[14px] border border-gray-100 bg-white p-6 grid gap-4">
          <input placeholder="Your name" className="h-[40px] rounded-[9px] border border-gray-100 px-3 text-[13px]" />
          <input placeholder="Email" className="h-[40px] rounded-[9px] border border-gray-100 px-3 text-[13px]" />
          <textarea placeholder="How can we help?" rows={4} className="rounded-[9px] border border-gray-100 p-3 text-[13px]" />
          <button className="h-[40px] rounded-[9px] bg-[#111111] text-white text-[13px] font-semibold hover:bg-black">Send message</button>
        </div>
      </div>
    </div>
  )
}
