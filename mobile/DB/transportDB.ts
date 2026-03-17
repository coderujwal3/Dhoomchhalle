export interface Transport {
  id: string;
  name: string;
  type: "auto" | "bus" | "e-rickshaw" | "taxi";
  baseFare: number;
  perKm: number;
}

export interface transportBasedFare {
  id: string;
  Fare: number;
}


export const transportBased: transportBasedFare[] = [
    {
      id: "auto",
      Fare: 2,
  },
  {
    id: "erickshaw",
    Fare: 2.5,
  },
  {
    id: "bus",
    Fare: 1.6,
  },
  {
    id: "taxi",
    Fare: 4,
  }
]

export const transports: Transport[] = [
  {
    id: "auto",
    name: "Auto Rickshaw",
    type: "auto",
    baseFare: 30,
    perKm: 12,
  },
  {
    id: "erickshaw",
    name: "E-Rickshaw",
    type: "e-rickshaw",
    baseFare: 20,
    perKm: 10,
  },
  {
    id: "bus",
    name: "City Bus",
    type: "bus",
    baseFare: 10,
    perKm: 5,
  },
  {
    id: "taxi",
    name: "Taxi / Cab",
    type: "taxi",
    baseFare: 80,
    perKm: 18,
  },
];