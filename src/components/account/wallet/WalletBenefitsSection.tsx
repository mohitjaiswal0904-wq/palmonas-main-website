import { WALLET_BENEFITS } from '@/config/wallet/wallet.config';

export function WalletBenefitsSection() {
  return (
    <section className="mt-10" aria-labelledby="wallet-benefits-heading">
      <h2 id="wallet-benefits-heading" className="text-base font-bold text-[#151515]">
        Why use Palmonas Wallet?
      </h2>
      <ul className="mt-4 space-y-3">
        {WALLET_BENEFITS.map((benefit) => (
          <li
            key={benefit.title}
            className="rounded-2xl border border-[#EEEEEE] bg-white px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">
                {benefit.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-[#151515]">{benefit.title}</p>
                <p className="mt-1 text-xs leading-5 font-normal text-[#757575]">
                  {benefit.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
