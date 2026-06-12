import {
  GiSpellBook,
  GiBlackBook,
  GiBookshelf,
  GiOpenBook,
  GiBookCover,
  GiBookmark,
} from "react-icons/gi";

const PUBLISHERS = [
  { icon: GiSpellBook, name: "Penguin" },
  { icon: GiBlackBook, name: "HarperCollins" },
  { icon: GiBookshelf, name: "Macmillan" },
  { icon: GiOpenBook, name: "Bloomsbury" },
  { icon: GiBookCover, name: "Random House" },
  { icon: GiBookmark, name: "Scribner" },
];

export function Publishers() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-4 text-center sm:px-6">
      <h2 className="font-serif text-2xl font-bold">Top Selling Published</h2>
      <p className="mt-2 text-sm text-gray-500">
        They are great popular publisher! Discover there publication lists.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {PUBLISHERS.map(({ icon: Icon, name }) => (
          <div
            key={name}
            className="flex items-center gap-2 text-gray-400 transition hover:text-brand-dark"
            title={name}
          >
            <Icon size={30} />
            <span className="text-sm font-semibold">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}




