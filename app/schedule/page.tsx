"use client";

import Link from "next/link";
import { useState } from "react";

const scheduleData = [
  {
    day: "Day 1",
    date: "Dec 22, 2025",
    title: "Arrival - Ubud Check-in",
    pax: "27 PAX",
    activities: [
      {
        time: "Arrival",
        icon: "✈️",
        title: "Airport pickup",
        details: "Pick up at Airport with flower garland",
      },
      {
        time: "Transfer",
        icon: "🚐",
        title: "Transfer to Santa Monica Ubud",
        details: "1h 50min - 2h drive",
      },
      {
        time: "Dinner",
        icon: "🍽️",
        title: "Dinner at Airbnb",
        details: "",
      },
    ],
  },
  {
    day: "Day 2",
    date: "Dec 23, 2025",
    title: "Ubud - ATV + VW Ride",
    pax: "27 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Pick up at Santa Monica Ubud",
        details: "",
      },
      {
        time: "Morning",
        icon: "🏍️",
        title: "ATV Ride",
        details: "14 Pax (7 Tandem)",
      },
      {
        time: "",
        icon: "🚗",
        title: "VW Ride",
        details: "9 Pax (3 VW, 1 Hour)",
      },
      {
        time: "Lunch",
        icon: "🍽️",
        title: "Lunch at local restaurant",
        details: "",
      },
      {
        time: "Afternoon",
        icon: "⛲",
        title: "Tirta Empul Temple visit",
        details: "",
      },
      {
        time: "",
        icon: "🏛️",
        title: "Ubud Palace & Ubud Market",
        details: "",
      },
      {
        time: "Dinner",
        icon: "🍽️",
        title: "Dinner at local restaurant",
        details: "",
      },
      {
        time: "",
        icon: "🏨",
        title: "Return to hotel",
        details: "",
      },
    ],
  },
  {
    day: "Day 3",
    date: "Dec 24, 2025",
    title: "Alas Harum - Swing Tour",
    pax: "27 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Pick up at Santa Monica Ubud",
        details: "3 Hiace + 3 Guides",
      },
      {
        time: "",
        icon: "🚐",
        title: "Pick up Chang Jiet & Wei Ting",
        details: "Hotel near airport, drop to Alas Harum",
      },
      {
        time: "",
        icon: "🌿",
        title: "Alas Harum",
        details: "Entrance fee only",
      },
      {
        time: "Lunch",
        icon: "🍽️",
        title: "Lunch at local restaurant",
        details: "",
      },
      {
        time: "Afternoon",
        icon: "🎢",
        title: "Aloha Swing",
        details: "Unlimited swings",
      },
      {
        time: "",
        icon: "☕",
        title: "Oka Luwak Coffee Plantation",
        details: "",
      },
      {
        time: "Dinner",
        icon: "🍽️",
        title: "Dinner at local restaurant",
        details: "",
      },
      {
        time: "",
        icon: "🏨",
        title: "Return to Santa Monica Ubud",
        details: "",
      },
      {
        time: "Night",
        icon: "🎄",
        title: "Christmas Party with gift exchange game",
        details: "",
      },
    ],
  },
  {
    day: "Day 4",
    date: "Dec 25, 2025",
    title: "Christmas - Ubud to Seminyak",
    pax: "27 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Pick up at Santa Monica Ubud",
        details: "",
      },
      {
        time: "Lunch",
        icon: "🍽️",
        title: "Lunch at Ubud Restaurant",
        details: "",
      },
      {
        time: "Afternoon",
        icon: "🏖️",
        title: "Love Anchor Canggu Bazaar",
        details: "",
      },
      {
        time: "",
        icon: "🏨",
        title: "Check-in at Lotus Tirta Seminyak",
        details: "",
      },
      {
        time: "Dinner",
        icon: "🦞",
        title: "Dinner at Jimbaran Seafood",
        details: "",
      },
    ],
  },
  {
    day: "Day 5",
    date: "Dec 26, 2025",
    title: "Free Day",
    pax: "27 PAX",
    activities: [
      {
        time: "All Day",
        icon: "🌴",
        title: "Free day",
        details: "Self-arranged activities",
      },
    ],
  },
  {
    day: "Day 6",
    date: "Dec 27, 2025",
    title: "Seminyak - Airport",
    pax: "27 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Pick up by driver at hotel",
        details: "",
      },
      {
        time: "13:30+",
        icon: "✈️",
        title: "Transfer to Airport",
        details: "Departures from 13:30 onwards",
      },
    ],
  },
];

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(0);
  const hotelDetails =
    selectedDay <= 2
      ? {
          period: "Dec 22-25 • Ubud",
          map: "https://maps.app.goo.gl/f9wxVkWxQSoCjpfPA?g_st=ic",
          address:
            "G73M+556, Pejeng Kawan, Tampaksiring, Gianyar Regency, Bali 80552, Indonesia",
        }
      : selectedDay <= 4
        ? {
            period: "Dec 25-27 • Seminyak",
            map: "https://maps.app.goo.gl/FQahruHFMcuW61hv6?g_st=ic",
            address:
              "Jl. Drupadi II No.99 TM, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361, Indonesia",
          }
        : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#00b4fb] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">📅 Trip Schedule</h1>
              <p className="text-sm opacity-90">Dec 22-27, 2025 • Bali</p>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {scheduleData.map((dayData, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex flex-col items-center ${
                  selectedDay === index
                    ? "bg-white text-[#00b4fb] shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <div>{dayData.day}</div>
                <div className="text-xs opacity-75">{dayData.date.split(',')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Day Header */}
        <div className="mb-4 bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">
              {scheduleData[selectedDay].day}
            </h2>
            <span className="text-sm text-white bg-[#ff8522] px-3 py-1 rounded-full">
              {scheduleData[selectedDay].pax}
            </span>
          </div>
          <p className="text-white/70">{scheduleData[selectedDay].date}</p>
          <p className="text-lg font-semibold text-[#00b4fb] mt-1">
            {scheduleData[selectedDay].title}
          </p>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {scheduleData[selectedDay].activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl">{activity.icon}</div>

                {/* Content */}
                <div className="flex-1">
                  {activity.time && (
                    <div className="text-xs text-[#00b4fb] font-medium mb-1">
                      {activity.time}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-[#011a42]">
                    {activity.title}
                  </h3>
                  {activity.details && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hotel Details */}
        {hotelDetails && (
          <div className="mt-6 bg-[#436c34]/20 border border-[#436c34]/30 rounded-xl p-4">
            <h3 className="font-semibold text-[#436c34] mb-2">
              🏨 Hotel Details
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white">{hotelDetails.period}</p>
              <a
                href={hotelDetails.map}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#00b4fb] break-all"
              >
                View on Map
              </a>
              <p className="text-white/70">{hotelDetails.address}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-[#00b4fb]/20 border border-[#00b4fb]/30 rounded-xl p-4">
          <h3 className="font-semibold text-[#00b4fb] mb-2">📋 Included:</h3>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• Private car + driver + petrol</li>
            <li>• Entrance tickets to all destinations</li>
            <li>• Complimentary 1 bottle mineral water/person/day</li>
            <li>• Parking fee + retribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
