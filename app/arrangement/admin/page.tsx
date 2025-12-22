"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase, CarAssignment, RoomAssignment } from "@/lib/supabase";
import { ArrowLeft, Save, Edit2, Users, Trash2 } from "lucide-react";

type MainTab = "car" | "room";
type HotelTab = "hotel1" | "hotel2";

export default function AdminArrangementsPage() {
  const { member } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>("car");
  const [activeHotel, setActiveHotel] = useState<HotelTab>("hotel1");
  const [cars, setCars] = useState<CarAssignment[]>([]);
  const [rooms, setRooms] = useState<RoomAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selection state for swapping
  const [selectedPerson, setSelectedPerson] = useState<{
    name: string;
    containerType: "car" | "room";
    containerId: string;
  } | null>(null);

  // Edit car name state
  const [editingCar, setEditingCar] = useState<string | null>(null);
  const [editCarName, setEditCarName] = useState("");

  const supabase = getSupabase();

  // Check if user is dev
  useEffect(() => {
    if (!member) {
      router.push("/login");
      return;
    }
    if (!member.is_dev) {
      router.push("/");
      return;
    }
  }, [member, router]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Get room capacity based on room type
  const getRoomCapacity = (roomType: string): number => {
    const capacities: Record<string, number> = {
      'twin': 2,
      'double': 2,
      'triple': 3,
      'family': 4,
      'standard': 2,
      '2br-villa': 4,
      '3br-villa': 6,
    };
    return capacities[roomType] || 2;
  };

  // Ensure room has empty slots up to capacity
  const ensureEmptySlots = (room: RoomAssignment): RoomAssignment => {
    const capacity = getRoomCapacity(room.room_type);
    const currentMembers = room.members.filter(m => m.trim() !== "");
    const emptySlots = capacity - currentMembers.length;

    if (emptySlots > 0) {
      const newMembers = [...currentMembers, ...Array(emptySlots).fill("")];
      return { ...room, members: newMembers };
    }

    return { ...room, members: currentMembers };
  };

  const loadData = async () => {
    setLoading(true);

    // Load cars
    const { data: carsData } = await supabase
      .from("car_assignments")
      .select("*")
      .order("display_order");

    if (carsData) {
      setCars(carsData as CarAssignment[]);
    }

    // Load rooms and add empty slots
    const { data: roomsData } = await supabase
      .from("room_assignments")
      .select("*")
      .order("display_order");

    if (roomsData) {
      const roomsWithSlots = (roomsData as RoomAssignment[]).map(ensureEmptySlots);
      setRooms(roomsWithSlots);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // Update all cars
    for (const car of cars) {
      await supabase
        .from("car_assignments")
        .update({
          car_name: car.car_name,
          leader: car.leader,
          members: car.members,
          updated_at: new Date().toISOString(),
        })
        .eq("id", car.id);
    }

    // Update or insert rooms (clean up empty slots before saving)
    for (const room of rooms) {
      // Remove empty slots before saving to database
      const cleanedMembers = room.members.filter(m => m && m.trim() !== "");

      // If room is completely empty, delete it
      if (cleanedMembers.length === 0) {
        if (!room.id.startsWith("temp_")) {
          // Only delete if it's an existing room in database
          console.log(`Deleting empty room: ${room.id}`);
          const { error } = await supabase
            .from("room_assignments")
            .delete()
            .eq("id", room.id);

          if (error) {
            console.error(`Error deleting room ${room.id}:`, error);
          } else {
            console.log(`Successfully deleted room ${room.id}`);
          }
        }
        // Skip insertion/update for empty rooms
        continue;
      }

      if (room.id.startsWith("temp_")) {
        // New room - insert it (only if not empty)
        const { data } = await supabase
          .from("room_assignments")
          .insert({
            hotel_key: room.hotel_key,
            hotel_name: room.hotel_name,
            room_type: room.room_type,
            room_label: room.room_label,
            members: cleanedMembers,
            note: room.note,
            display_order: room.display_order,
          })
          .select()
          .single();

        // Update the local state with the real ID
        if (data) {
          const index = rooms.findIndex(r => r.id === room.id);
          if (index !== -1) {
            rooms[index].id = data.id;
          }
        }
      } else {
        // Existing room - update it
        await supabase
          .from("room_assignments")
          .update({
            hotel_name: room.hotel_name,
            room_label: room.room_label,
            members: cleanedMembers,
            note: room.note,
            updated_at: new Date().toISOString(),
          })
          .eq("id", room.id);
      }
    }

    setSaving(false);
    alert("✅ Arrangements saved successfully!");
    loadData(); // Reload to get fresh data with real IDs and empty slots
  };

  // Handle person click for swapping (including empty slots)
  const handlePersonClick = (
    name: string,
    containerType: "car" | "room",
    containerId: string,
    isEmptySlot: boolean = false
  ) => {
    // Don't allow selecting empty slot as first selection
    if (!selectedPerson && isEmptySlot) {
      return;
    }

    if (!selectedPerson) {
      // First selection (must be a person, not empty)
      setSelectedPerson({ name, containerType, containerId });
    } else {
      // Second selection - perform swap (can be empty slot)
      if (selectedPerson.containerType === "car" && containerType === "car") {
        swapInCars(selectedPerson.name, name, selectedPerson.containerId, containerId);
      } else if (selectedPerson.containerType === "room" && containerType === "room") {
        swapInRooms(selectedPerson.name, name, selectedPerson.containerId, containerId, isEmptySlot);
      }
      setSelectedPerson(null);
    }
  };

  const swapInCars = (
    person1: string,
    person2: string,
    car1Id: string,
    car2Id: string
  ) => {
    const newCars = cars.map((car) => {
      if (car.id === car1Id) {
        const members = [...car.members];
        const idx = members.indexOf(person1);
        if (idx !== -1) {
          if (car1Id === car2Id) {
            // Same car - swap positions
            const idx2 = members.indexOf(person2);
            if (idx2 !== -1) {
              [members[idx], members[idx2]] = [members[idx2], members[idx]];
            }
          } else {
            // Different car - remove person1
            members.splice(idx, 1);
          }
        }
        return { ...car, members };
      }
      if (car.id === car2Id && car1Id !== car2Id) {
        // Different car - add person1, remove person2
        const members = [...car.members];
        const idx2 = members.indexOf(person2);
        if (idx2 !== -1) {
          members[idx2] = person1;
        }
        return { ...car, members };
      }
      return car;
    });

    // If different cars, also move person2 to car1
    if (car1Id !== car2Id) {
      const finalCars = newCars.map((car) => {
        if (car.id === car1Id) {
          return { ...car, members: [...car.members, person2] };
        }
        return car;
      });
      setCars(finalCars);
    } else {
      setCars(newCars);
    }
  };

  const swapInRooms = (
    person1: string,
    person2: string,
    room1Id: string,
    room2Id: string,
    isEmptySlot: boolean = false
  ) => {
    const newRooms = rooms.map((room) => {
      if (room.id === room1Id) {
        const members = [...room.members];
        const idx = members.indexOf(person1);
        if (idx !== -1) {
          if (room1Id === room2Id) {
            // Same room - swap positions
            if (isEmptySlot) {
              // Moving to empty slot in same room - just replace empty with person
              const idx2 = members.findIndex(m => m.trim() === "");
              if (idx2 !== -1) {
                members[idx] = ""; // Empty the old position
                members[idx2] = person1; // Fill the empty slot
              }
            } else {
              const idx2 = members.indexOf(person2);
              if (idx2 !== -1) {
                [members[idx], members[idx2]] = [members[idx2], members[idx]];
              }
            }
          } else {
            // Different room - remove person1 (will be added to other room)
            members.splice(idx, 1);
          }
        }
        return { ...room, members };
      }
      if (room.id === room2Id && room1Id !== room2Id) {
        const members = [...room.members];
        if (isEmptySlot) {
          // Moving to empty slot in different room - just fill the empty slot
          const emptyIdx = members.findIndex(m => m.trim() === "");
          if (emptyIdx !== -1) {
            members[emptyIdx] = person1;
          }
        } else {
          // Moving to occupied slot - swap person1 with person2
          const idx2 = members.indexOf(person2);
          if (idx2 !== -1) {
            members[idx2] = person1;
          }
        }
        return { ...room, members };
      }
      return room;
    });

    // If different rooms and NOT empty slot, also move person2 to room1
    if (room1Id !== room2Id && !isEmptySlot) {
      const finalRooms = newRooms.map((room) => {
        if (room.id === room1Id) {
          return { ...room, members: [...room.members, person2] };
        }
        return room;
      });
      setRooms(finalRooms);
    } else {
      setRooms(newRooms);
    }
  };

  const startEditCarName = (car: CarAssignment) => {
    setEditingCar(car.id);
    setEditCarName(car.car_name);
  };

  const saveCarName = (carId: string) => {
    setCars(
      cars.map((car) =>
        car.id === carId ? { ...car, car_name: editCarName } : car
      )
    );
    setEditingCar(null);
  };

  const addRoom = () => {
    const newRoom: RoomAssignment = {
      id: `temp_${Date.now()}`,
      hotel_key: activeHotel,
      hotel_name: activeHotel === "hotel1" ? "Santa Monica Ubud" : "Lotus Tirta Seminyak",
      room_type: "standard",
      room_label: null,
      members: ["", "", "", ""], // 4 empty slots
      note: null,
      display_order: rooms.filter((r) => r.hotel_key === activeHotel).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRooms([...rooms, newRoom]);
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;

    // If it's a temp room, just remove from state
    if (roomId.startsWith("temp_")) {
      setRooms(rooms.filter((r) => r.id !== roomId));
    } else {
      // Delete from database
      await supabase.from("room_assignments").delete().eq("id", roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
    }
  };

  if (!member?.is_dev) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const filteredRooms = rooms.filter((r) => r.hotel_key === activeHotel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#ff8522] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/arrangement")} className="hover:opacity-80">
                <ArrowLeft className="w-6 h-6 text-black" />
              </button>
              <h1 className="text-xl font-bold text-black">Edit Arrangements</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-white text-[#ff8522] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          <p className="text-sm text-black/80">
            Click 2 people to swap them. Click again to deselect.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Main Tabs */}
        <div className="bg-white/10 rounded-full p-1 flex gap-2 mb-5">
          <button
            onClick={() => {
              setActiveTab("car");
              setSelectedPerson(null);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "car"
                ? "bg-[#ff8522] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            🚗 Cars
          </button>
          <button
            onClick={() => {
              setActiveTab("room");
              setSelectedPerson(null);
            }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "room"
                ? "bg-[#00b4fb] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            🏨 Rooms
          </button>
        </div>

        {activeTab === "car" ? (
          <div className="space-y-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-2xl shadow-md p-4"
              >
                {/* Car Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚐</span>
                    {editingCar === car.id ? (
                      <input
                        type="text"
                        value={editCarName}
                        onChange={(e) => setEditCarName(e.target.value)}
                        className="text-lg font-bold text-[#011a42] border-b-2 border-[#ff8522] px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <h2 className="text-lg font-bold text-[#011a42]">
                        {car.car_name}
                      </h2>
                    )}
                  </div>
                  {editingCar === car.id ? (
                    <button
                      onClick={() => saveCarName(car.id)}
                      className="text-sm bg-[#ff8522] text-white px-3 py-1 rounded-lg"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditCarName(car)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {car.members.map((memberName, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePersonClick(memberName, "car", car.id)}
                      className={`text-sm text-[#011a42] rounded-lg px-3 py-2 text-center font-medium transition-all ${
                        selectedPerson?.name === memberName &&
                        selectedPerson?.containerId === car.id
                          ? "bg-[#ff8522] text-white ring-2 ring-[#ff8522]"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {memberName}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Hotel Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setActiveHotel("hotel1");
                  setSelectedPerson(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeHotel === "hotel1"
                    ? "bg-[#00b4fb] text-white shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Hotel 1
              </button>
              <button
                onClick={() => {
                  setActiveHotel("hotel2");
                  setSelectedPerson(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeHotel === "hotel2"
                    ? "bg-[#00b4fb] text-white shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Hotel 2
              </button>
            </div>

            {/* Add Room Button */}
            <button
              onClick={addRoom}
              className="w-full mb-4 bg-[#00b4fb] text-white py-3 rounded-xl font-semibold hover:bg-[#4dc9ff] transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Add New Room
            </button>

            {/* Rooms List */}
            <div className="space-y-3">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-md p-4"
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-[#00b4fb]">
                      {room.room_type.toUpperCase()}
                      {room.room_label && ` - ${room.room_label}`}
                    </div>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Members Grid (including empty slots) */}
                  <div className="grid grid-cols-2 gap-2">
                    {room.members.map((memberName, idx) => {
                      const isEmpty = memberName.trim() === "";
                      const isClickable = isEmpty ? selectedPerson !== null : true;

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            handlePersonClick(memberName, "room", room.id, isEmpty)
                          }
                          className={`text-sm rounded-lg px-3 py-2 text-center font-medium transition-all ${
                            isEmpty
                              ? isClickable
                                ? "bg-green-50 text-green-600 border-2 border-dashed border-green-400 hover:bg-green-100 cursor-pointer"
                                : "bg-gray-50 text-gray-300 cursor-default border border-dashed border-gray-300"
                              : selectedPerson?.name === memberName &&
                                selectedPerson?.containerId === room.id
                              ? "bg-[#00b4fb] text-white ring-2 ring-[#00b4fb]"
                              : "bg-gray-100 hover:bg-gray-200 text-[#011a42]"
                          }`}
                        >
                          {isEmpty ? (isClickable ? "Click to move here" : "Empty") : memberName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
