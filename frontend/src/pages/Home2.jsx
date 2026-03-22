const homeCards = [
  {
    title: 'Home Card 1',
    image: '/home icons/ChatGPT Image Mar 22, 2026, 12_27_17 PM-Photoroom.png'
  },
  {
    title: 'Home Card 2',
    image: '/home icons/ChatGPT Image Mar 22, 2026, 12_27_19 PM-Photoroom.png'
  },
  {
    title: 'Home Card 3',
    image: '/home icons/ChatGPT Image Mar 22, 2026, 12_27_21 PM-Photoroom.png'
  },
  {
    title: 'Home Card 4',
    image: '/home icons/ChatGPT Image Mar 22, 2026, 12_27_23 PM-Photoroom.png'
  }
];

export default function Home2() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_22%),linear-gradient(180deg,#e0f2fe_0%,#f8fafc_38%,#ecfeff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 md:grid-cols-4 md:gap-6">
          {homeCards.map((card) => (
            <div
              key={card.title}
              className="group transition duration-300 hover:-translate-y-1"
            >
              <div className="flex min-h-[360px] items-center justify-center p-0 md:min-h-[280px] md:p-2">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-full w-full object-contain transition duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
