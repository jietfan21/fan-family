"use client";

import Link from "next/link";
import { useState } from "react";

type MainTab = "car" | "room";
type HotelTab = "hotel1" | "hotel2";

const vanGroups = [
  {
    name: "Van A",
    leader: "聪婷",
    members: [
      "国雄",
      "Kris",
      "昌鸿",
      "昌荣",
      "Cikgu",
      "凤春",
      "聪琳",
      "聪婷",
      "聪云",
    ],
  },
  {
    name: "Van B",
    leader: "敬铭",
    members: [
      "国强",
      "君毓",
      "敬铭",
      "国光",
      "Kelly",
      "昌贤",
      "昌容",
      "昌捷",
      "炜婷",
    ],
  },
  {
    name: "Van C",
    leader: "昌耀",
    members: [
      "思瑩",
      "聪颖",
      "阿辉",
      "老王",
      "WENDY",
      "昌耀",
      "美凤",
      "Thomas",
      "敬扬",
    ],
  },
];

const santaMonicaRooms = [
  {
    title: "Twin Single Bed Rooms",
    items: ["昌鴻 + 昌榮", "敬銘 + 昌賢"],
  },
  {
    title: "Double Bed Rooms",
    items: ["國雄 + Kris", "國强 + 君毓", "Cikgu + 鳳春", "國光 + Kelly"],
  },
];

const villaKalaRooms = [
  {
    title: "Twin Single Bed Rooms",
    items: ["聰婷 + 聰雲", "思瑩 + 聰琳"],
  },
  {
    title: "Double Bed Rooms",
    items: [
      "美鳳 + Thomas + JY",
      "聰穎 + 阿輝 (Extra bed: 昌捷 + 炜婷)",
      "Wendy + 老王",
      "昌容 + 昌耀",
    ],
  },
];

const hotelData: Record<
  HotelTab,
  {
    tabLabel: string;
    title: string;
    subtitle: string;
    dates: string;
    sections: { title: string; items: string[] }[];
  }
> = {
  hotel1: {
    tabLabel: "Hotel 1",
    title: "Ubud Stay",
    subtitle: "Santa Monica Ubud + Villa Kala Ubud",
    dates: "Dec 22-25, 2025",
    sections: [],
  },
  hotel2: {
    tabLabel: "Hotel 2",
    title: "Seminyak Stay",
    subtitle: "Lotus Tirta Seminyak",
    dates: "Dec 25-27, 2025",
    sections: [
      {
        title: "6 Standard Double Rooms",
        items: [
          "聰穎 + 阿輝",
          "Wendy + 老王",
          "昌捷 + 炜婷",
          "思瑩 + 聰琳",
          "昌容",
          "昌耀 + 昌賢",
        ],
      },
      {
        title: "Two-Bedroom Pool Villa",
        items: ["國雄 + Kris", "昌榮 + 昌鴻"],
      },
      {
        title: "Three-Bedroom Pool Villas",
        items: [
          "Villa 1: 國强 + 君毓, Cikgu + 鳳春, 國光 + Kelly",
          "Villa 2: 美鳳 + Thomas, 聰婷 + 聰雲, 敬銘 + JY",
        ],
      },
    ],
  },
};

export default function ArrangementPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("car");
  const [activeHotel, setActiveHotel] = useState<HotelTab>("hotel1");
  const selectedHotel = hotelData[activeHotel];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">Car & Room Arrangement</h1>
            <p className="text-sm opacity-90">Dec 22-27, 2025 • Bali</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Main Tabs */}
        <div className="bg-white rounded-full p-1 shadow-sm flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("car")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "car"
                ? "bg-red-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Car
          </button>
          <button
            onClick={() => setActiveTab("room")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "room"
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Room
          </button>
        </div>

        {activeTab === "car" ? (
          <div className="space-y-4">
            {vanGroups.map((van) => (
              <div
                key={van.name}
                className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚐</span>
                    <div>
                      <p className="text-xs text-gray-500">Leader</p>
                      <h2 className="text-lg font-bold text-gray-800">
                        {van.name}
                      </h2>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    {van.leader}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {van.members.map((member) => (
                    <div
                      key={member}
                      className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2 text-center"
                    >
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Hotel Tabs */}
            <div className="flex gap-2 mb-4">
              {(Object.keys(hotelData) as HotelTab[]).map((hotelKey) => (
                <button
                  key={hotelKey}
                  onClick={() => setActiveHotel(hotelKey)}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeHotel === hotelKey
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                  }`}
                >
                  {hotelData[hotelKey].tabLabel}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <p className="text-xs text-gray-500">{selectedHotel.dates}</p>
              <h2 className="text-lg font-bold text-gray-800 mt-1">
                {selectedHotel.title}
              </h2>
              <p className="text-sm text-gray-600">{selectedHotel.subtitle}</p>
            </div>

            {activeHotel === "hotel1" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    Santa Monica Ubud
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Twin + Double Rooms
                  </p>
                  <div className="space-y-4">
                    {santaMonicaRooms.map((group) => (
                      <div key={group.title}>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {group.title}
                        </h4>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    Villa Kala Ubud
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Twin + Double Rooms
                  </p>
                  <div className="space-y-4">
                    {villaKalaRooms.map((group) => (
                      <div key={group.title}>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {group.title}
                        </h4>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedHotel.sections.map((section) => (
                  <div
                    key={section.title}
                    className="bg-white rounded-2xl shadow-md p-4"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {section.title}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
