import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import CartPageContent from '@/components/CartPageContent';

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="border-b border-gray-100 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-20 lg:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              কোর্স, বান্ডেল আর add-on একসাথে Pay করুন
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              এখানে final payable, referral discount আর wallet deduction আগে থেকেই preview পাবেন। তারপর
              একবারেই Pay করতে পারবেন।
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
          <CartPageContent />
        </div>
      </section>
      <Footer />
    </main>
  );
}
