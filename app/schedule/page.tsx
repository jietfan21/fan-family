"use client";

import Link from "next/link";
import { useState } from "react";

const scheduleData = [
  {
    day: "Day 1",
    date: "Dec 22, 2023",
    title: "Airport - Check in Hotel Ubud",
    pax: "23 PAX",
    activities: [
      {
        time: "Arrival",
        icon: "✈️",
        title: "Airport Pickup",
        details: "Pick up at Airport with flower garland",
      },
      {
        time: "",
        icon: "🏨",
        title: "Check-in at Santa Monica Ubud",
        details: "Drop only - Rest day",
      },
    ],
  },
  {
    day: "Day 2",
    date: "Dec 23, 2023",
    title: "Ubud - ATV Ride",
    pax: "23 PAX",
    activities: [
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
        details: "9 Pax (3 VW) - 1 Hour",
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
        title: "Tirta Empul Temple",
        details: "Holy water temple visit",
      },
      {
        time: "",
        icon: "🏛️",
        title: "Ubud Palace & Market",
        details: "Shopping and sightseeing",
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
        title: "Back to Hotel",
        details: "Duration: 10-12 hours",
      },
    ],
  },
  {
    day: "Day 3",
    date: "Dec 24, 2023",
    title: "Alas Harum - Swing Tour",
    pax: "25 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Pick up at Santa Monica Ubud",
        details: "3 Hiace + 3 Guides",
      },
      {
        time: "",
        icon: "🌿",
        title: "Alas Harum",
        details: "Entrance fee included",
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
        details: "Unlimited swings!",
      },
      {
        time: "",
        icon: "☕",
        title: "Oka Luwak Coffee Plantation",
        details: "Coffee tasting",
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
        title: "Back to Santa Monica Ubud",
        details: "Duration: 10-12 hours",
      },
    ],
  },
  {
    day: "Day 4",
    date: "Dec 25, 2023",
    title: "Ubud - Canggu",
    pax: "25 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Check out Santa Monica Ubud",
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
        details: "Beach club & shopping",
      },
      {
        time: "",
        icon: "🏨",
        title: "Check in Lotus Tirta Seminyak",
        details: "",
      },
      {
        time: "Dinner",
        icon: "🦞",
        title: "Dinner at Jimbaran Seafood",
        details: "Beachside seafood dinner",
      },
      {
        time: "",
        icon: "🏨",
        title: "Back to Hotel",
        details: "Duration: 10-12 hours",
      },
    ],
  },
  {
    day: "Day 5",
    date: "Dec 26, 2023",
    title: "Free Time",
    pax: "25 PAX",
    activities: [
      {
        time: "All Day",
        icon: "🌴",
        title: "Free Time - No Service",
        details: "Explore on your own, relax at the hotel, or visit nearby attractions",
      },
    ],
  },
  {
    day: "Day 6",
    date: "Dec 27, 2023",
    title: "Hotel - Airport",
    pax: "25 PAX",
    activities: [
      {
        time: "Morning",
        icon: "🏨",
        title: "Hotel Pickup",
        details: "",
      },
      {
        time: "13:30",
        icon: "✈️",
        title: "Airport Drop",
        details: "Departure flight at 13:30 PM",
      },
    ],
  },
];

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-2xl">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">Trip Schedule</h1>
              <p className="text-sm opacity-90">Dec 22-27, 2025 • Bali</p>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {scheduleData.map((dayData, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedDay === index
                    ? "bg-white text-red-600 shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {dayData.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Day Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {scheduleData[selectedDay].day}
            </h2>
            <span className="text-sm text-white bg-red-500 px-3 py-1 rounded-full">
              {scheduleData[selectedDay].pax}
            </span>
          </div>
          <p className="text-gray-600">{scheduleData[selectedDay].date}</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">
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
                    <div className="text-xs text-gray-500 font-medium mb-1">
                      {activity.time}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-800">
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

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Included:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
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
