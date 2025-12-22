"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabase, Member } from "@/lib/supabase";
import MemberBadge from "@/components/MemberBadge";
import MemberModal from "@/components/MemberModal";

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

type RoomData = {
  type: "twin" | "double" | "triple" | "family";
  members: string[];
  note?: string;
};

type HotelRooms = {
  name: string;
  icon: string;
  rooms: RoomData[];
};

const hotel1Data: HotelRooms[] = [
  {
    name: "Santa Monica Ubud",
    icon: "🏨",
    rooms: [
      { type: "twin", members: ["昌鸿", "昌荣"] },
      { type: "twin", members: ["敬铭", "昌贤"] },
      { type: "double", members: ["国雄", "Kris"] },
      { type: "double", members: ["国强", "君毓"] },
      { type: "double", members: ["Cikgu", "凤春"] },
      { type: "double", members: ["国光", "Kelly"] },
    ],
  },
  {
    name: "Villa Kala Ubud",
    icon: "🏡",
    rooms: [
      { type: "twin", members: ["聪婷", "聪云"] },
      { type: "twin", members: ["思瑩", "聪琳"] },
      { type: "triple", members: ["美凤", "Thomas", "敬扬"] },
      { type: "family", members: ["聪颖", "阿辉", "昌捷", "炜婷"], note: "Extra bed" },
      { type: "double", members: ["WENDY", "老王"] },
      { type: "double", members: ["昌容", "昌耀"] },
    ],
  },
];

type Hotel2RoomData = {
  type: "standard" | "2br-villa" | "3br-villa";
  label?: string;
  members: string[];
};

const hotel2Data: Hotel2RoomData[] = [
  { type: "standard", members: ["聪颖", "阿辉"] },
  { type: "standard", members: ["WENDY", "老王"] },
  { type: "standard", members: ["昌捷", "炜婷"] },
  { type: "standard", members: ["思瑩", "聪琳"] },
  { type: "standard", members: ["昌容"] },
  { type: "standard", members: ["昌耀", "昌贤"] },
  { type: "2br-villa", members: ["国雄", "Kris", "昌荣", "昌鸿"] },
  { type: "3br-villa", label: "Villa 1", members: ["国强", "君毓", "Cikgu", "凤春", "国光", "Kelly"] },
  { type: "3br-villa", label: "Villa 2", members: ["美凤", "Thomas", "聪婷", "聪云", "敬铭", "敬扬"] },
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
          "聪颖 + 阿辉",
          "WENDY + 老王",
          "昌捷 + 炜婷",
          "思瑩 + 聪琳",
          "昌容",
          "昌耀 + 昌贤",
        ],
      },
      {
        title: "Two-Bedroom Pool Villa",
        items: ["国雄 + Kris", "昌荣 + 昌鸿"],
      },
      {
        title: "Three-Bedroom Pool Villas",
        items: [
          "Villa 1: 国强 + 君毓, Cikgu + 凤春, 国光 + Kelly",
          "Villa 2: 美凤 + Thomas, 聪婷 + 聪云, 敬铭 + 敬扬",
        ],
      },
    ],
  },
};

export default function ArrangementPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("car");
  const [activeHotel, setActiveHotel] = useState<HotelTab>("hotel1");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<{
    member: Member | null;
    displayName: string;
  } | null>(null);

  const selectedHotel = hotelData[activeHotel];

  useEffect(() => {
    async function fetchMembers() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("members")
          .select("*");
        if (data) {
          setMembers(data);
        }
      } catch {
        // Supabase not configured, continue without member data
      }
    }
    fetchMembers();
  }, []);

  const handleMemberClick = (member: Member | null, displayName: string) => {
    setSelectedMember({ member, displayName });
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#ff8522] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">🚐 Car & Room Arrangement</h1>
            <p className="text-sm opacity-90">Dec 22-27, 2025 • Bali</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Main Tabs */}
        <div className="bg-white/10 rounded-full p-1 flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("car")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "car"
                ? "bg-[#ff8522] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Car
          </button>
          <button
            onClick={() => setActiveTab("room")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "room"
                ? "bg-[#00b4fb] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
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
                      <h2 className="text-lg font-bold text-[#011a42]">
                        {van.name}
                      </h2>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#ff8522] bg-[#ff8522]/10 px-3 py-1 rounded-full">
                    <MemberBadge
                      name={van.leader}
                      members={members}
                      onClick={handleMemberClick}
                    />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {van.members.map((memberName) => (
                    <div
                      key={memberName}
                      className="text-sm text-[#011a42] bg-gray-100 rounded-lg px-3 py-2 text-center"
                    >
                      <MemberBadge
                        name={memberName}
                        members={members}
                        onClick={handleMemberClick}
                      />
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
                      ? "bg-[#00b4fb] text-white shadow-md"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {hotelData[hotelKey].tabLabel}
                </button>
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-4 mb-4">
              <p className="text-xs text-white/60">{selectedHotel.dates}</p>
              <h2 className="text-lg font-bold text-white mt-1">
                {selectedHotel.title}
              </h2>
              <p className="text-sm text-[#00b4fb]">{selectedHotel.subtitle}</p>
            </div>

            {activeHotel === "hotel1" ? (
              <div className="space-y-6">
                {hotel1Data.map((hotel) => (
                  <div key={hotel.name}>
                    {/* Hotel Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{hotel.icon}</span>
                      <h3 className="text-lg font-bold text-white">{hotel.name}</h3>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {hotel.rooms.map((room, idx) => {
                        const roomTypeConfig = {
                          twin: { label: "Twin", icon: "🛏️🛏️", color: "bg-[#00b4fb]" },
                          double: { label: "Double", icon: "🛏️", color: "bg-[#436c34]" },
                          triple: { label: "Triple", icon: "🛏️", color: "bg-[#ff8522]" },
                          family: { label: "Family", icon: "🏠", color: "bg-[#9333ea]" },
                        };
                        const config = roomTypeConfig[room.type];

                        return (
                          <div
                            key={idx}
                            className="bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-shadow"
                          >
                            {/* Room Type Badge */}
                            <div className="flex items-center gap-1 mb-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${config.color}`}>
                                {config.label}
                              </span>
                              {room.note && (
                                <span className="text-xs text-gray-500">+{room.note}</span>
                              )}
                            </div>

                            {/* Members */}
                            <div className="flex flex-wrap gap-1">
                              {room.members.map((memberName) => (
                                <div
                                  key={memberName}
                                  className="text-sm bg-gray-100 rounded-lg px-2 py-1"
                                >
                                  <MemberBadge
                                    name={memberName}
                                    members={members}
                                    onClick={handleMemberClick}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Standard Rooms */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🚪</span>
                    <h3 className="text-base font-bold text-white">Standard Double Rooms</h3>
                    <span className="text-xs bg-[#00b4fb]/20 text-[#00b4fb] px-2 py-0.5 rounded-full">
                      {hotel2Data.filter(r => r.type === "standard").length} rooms
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {hotel2Data.filter(r => r.type === "standard").map((room, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-wrap gap-1">
                          {room.members.map((memberName) => (
                            <div
                              key={memberName}
                              className="text-sm bg-gray-100 rounded-lg px-2 py-1"
                            >
                              <MemberBadge
                                name={memberName}
                                members={members}
                                onClick={handleMemberClick}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2-Bedroom Villa */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🏡</span>
                    <h3 className="text-base font-bold text-white">Two-Bedroom Pool Villa</h3>
                  </div>
                  {hotel2Data.filter(r => r.type === "2br-villa").map((room, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-wrap gap-2">
                        {room.members.map((memberName) => (
                          <div
                            key={memberName}
                            className="text-sm bg-[#ff8522]/10 rounded-lg px-3 py-1.5"
                          >
                            <MemberBadge
                              name={memberName}
                              members={members}
                              onClick={handleMemberClick}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3-Bedroom Villas */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🏠</span>
                    <h3 className="text-base font-bold text-white">Three-Bedroom Pool Villas</h3>
                  </div>
                  <div className="space-y-3">
                    {hotel2Data.filter(r => r.type === "3br-villa").map((room, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                      >
                        {room.label && (
                          <div className="text-xs font-semibold text-[#9333ea] mb-2">{room.label}</div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {room.members.map((memberName) => (
                            <div
                              key={memberName}
                              className="text-sm bg-[#9333ea]/10 rounded-lg px-3 py-1.5"
                            >
                              <MemberBadge
                                name={memberName}
                                members={members}
                                onClick={handleMemberClick}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MemberModal
        isOpen={selectedMember !== null}
        onClose={closeModal}
        member={selectedMember?.member || null}
        displayName={selectedMember?.displayName || ""}
        allMembers={members}
      />
    </div>
  );
}
