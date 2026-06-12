import { FiTruck, FiTag, FiShield, FiRefreshCw } from "react-icons/fi";

const FEATURES = [
  {
    icon: FiTruck,
    title: "Free Delivery",
    text: "On every order, no minimum",
  },
  {
    icon: FiTag,
    title: "Best Price Promise",
    text: "Compare sellers, pay the lowest",
  },
  {
    icon: FiShield,
    title: "Verified Sellers",
    text: "Every seller approved by admin",
  },
  {
    icon: FiRefreshCw,
    title: "Easy Cancellation",
    text: "Cancel any time before shipping",
  },
];

/** Modern benefits strip below the hero. */
export function FeatureStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-gray-100 shadow-lg shadow-black/5 ring-1 ring-gray-100 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="group flex items-center gap-4 bg-white p-5 transition hover:bg-brand-dark"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-yellow/15 text-brand-yellow-dark transition group-hover:bg-brand-yellow group-hover:text-brand-dark">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-dark transition group-hover:text-white">
                {title}
              </p>
              <p className="truncate text-xs text-gray-500 transition group-hover:text-gray-400">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
