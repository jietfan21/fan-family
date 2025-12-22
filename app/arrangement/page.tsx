"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase, Member, CarAssignment, RoomAssignment } from "@/lib/supabase";
import MemberBadge from "@/components/MemberBadge";
import MemberModal from "@/components/MemberModal";
import { Settings } from "lucide-react";

type MainTab = "car" | "room";
type HotelTab = "hotel1" | "hotel2";

const hotelData: Record<
  HotelTab,
  {
    tabLabel: string;
    title: string;
    subtitle: string;
    dates: string;
  }
> = {
  hotel1: {
    tabLabel: "Hotel 1",
    title: "Ubud Stay",
    subtitle: "Santa Monica Ubud + Villa Kala Ubud",
    dates: "Dec 22-25, 2025",
  },
  hotel2: {
    tabLabel: "Hotel 2",
    title: "Seminyak Stay",
    subtitle: "Lotus Tirta Seminyak",
    dates: "Dec 25-27, 2025",
  },
};

export default function ArrangementPage() {
  const { member } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>("car");
  const [activeHotel, setActiveHotel] = useState<HotelTab>("hotel1");
  const [members, setMembers] = useState<Member[]>([]);
  const [cars, setCars] = useState<CarAssignment[]>([]);
  const [rooms, setRooms] = useState<RoomAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<{
    member: Member | null;
    displayName: string;
  } | null>(null);

  const selectedHotel = hotelData[activeHotel];
  const supabase = getSupabase();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch members
        const { data: membersData } = await supabase
          .from("members")
          .select("*");
        if (membersData) {
          setMembers(membersData);
        }

        // Fetch cars
        const { data: carsData } = await supabase
          .from("car_assignments")
          .select("*")
          .order("display_order");
        if (carsData) {
          setCars(carsData as CarAssignment[]);
        }

        // Fetch rooms
        const { data: roomsData } = await supabase
          .from("room_assignments")
          .select("*")
          .order("display_order");
        if (roomsData) {
          setRooms(roomsData as RoomAssignment[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleMemberClick = (member: Member | null, displayName: string) => {
    setSelectedMember({ member, displayName });
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  // Group rooms by hotel name for hotel1
  const hotel1Rooms = rooms.filter((r) => r.hotel_key === "hotel1");
  const hotel1Groups: Record<string, RoomAssignment[]> = {};
  hotel1Rooms.forEach((room) => {
    if (!hotel1Groups[room.hotel_name]) {
      hotel1Groups[room.hotel_name] = [];
    }
    hotel1Groups[room.hotel_name].push(room);
  });

  const hotel2Rooms = rooms.filter((r) => r.hotel_key === "hotel2");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#ff8522] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">🚐 Car & Room Arrangement</h1>
              <p className="text-sm opacity-90">Dec 22-27, 2025 • Bali</p>
            </div>
          </div>
          {/* Settings button - only visible to admin */}
          {member?.is_dev && (
            <button
              onClick={() => router.push("/arrangement/admin")}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
              title="Edit arrangements"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
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
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚐</span>
                    <div>
                      <p className="text-xs text-gray-500">Leader</p>
                      <h2 className="text-lg font-bold text-[#011a42]">
                        {car.car_name}
                      </h2>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#ff8522] bg-[#ff8522]/10 px-3 py-1 rounded-full">
                    <MemberBadge
                      name={car.leader || ""}
                      members={members}
                      onClick={handleMemberClick}
                    />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {car.members.map((memberName, idx) => (
                    <div
                      key={idx}
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
                {Object.entries(hotel1Groups).map(([hotelName, hotelRooms]) => (
                  <div key={hotelName}>
                    {/* Hotel Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{hotelName.includes("Villa") ? "🏡" : "🏨"}</span>
                      <h3 className="text-lg font-bold text-white">{hotelName}</h3>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {hotelRooms.map((room) => {
                        const roomTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
                          twin: { label: "Twin", icon: "🛏️🛏️", color: "bg-[#00b4fb]" },
                          double: { label: "Double", icon: "🛏️", color: "bg-[#436c34]" },
                          triple: { label: "Triple", icon: "🛏️", color: "bg-[#ff8522]" },
                          family: { label: "Family", icon: "🏠", color: "bg-[#9333ea]" },
                        };
                        const config = roomTypeConfig[room.room_type] || roomTypeConfig.double;

                        return (
                          <div
                            key={room.id}
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
                              {room.members.filter(m => m.trim() !== "").map((memberName) => (
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
                {hotel2Rooms.filter(r => r.room_type === "standard").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🚪</span>
                      <h3 className="text-base font-bold text-white">Standard Double Rooms</h3>
                      <span className="text-xs bg-[#00b4fb]/20 text-[#00b4fb] px-2 py-0.5 rounded-full">
                        {hotel2Rooms.filter(r => r.room_type === "standard").length} rooms
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {hotel2Rooms.filter(r => r.room_type === "standard").map((room) => (
                        <div
                          key={room.id}
                          className="bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-wrap gap-1">
                            {room.members.filter(m => m.trim() !== "").map((memberName) => (
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
                )}

                {/* 2-Bedroom Villa */}
                {hotel2Rooms.filter(r => r.room_type === "2br-villa").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🏡</span>
                      <h3 className="text-base font-bold text-white">Two-Bedroom Pool Villa</h3>
                    </div>
                    {hotel2Rooms.filter(r => r.room_type === "2br-villa").map((room) => (
                      <div
                        key={room.id}
                        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-wrap gap-2">
                          {room.members.filter(m => m.trim() !== "").map((memberName) => (
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
                )}

                {/* 3-Bedroom Villas */}
                {hotel2Rooms.filter(r => r.room_type === "3br-villa").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🏠</span>
                      <h3 className="text-base font-bold text-white">Three-Bedroom Pool Villas</h3>
                    </div>
                    <div className="space-y-3">
                      {hotel2Rooms.filter(r => r.room_type === "3br-villa").map((room) => (
                        <div
                          key={room.id}
                          className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                        >
                          {room.room_label && (
                            <div className="text-xs font-semibold text-[#9333ea] mb-2">{room.room_label}</div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {room.members.filter(m => m.trim() !== "").map((memberName) => (
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
                )}
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
