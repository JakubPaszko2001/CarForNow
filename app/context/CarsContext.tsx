"use client";

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";

const CACHE_TTL = 5 * 60 * 1000;

export type Car = any;

export type Filters = {
  brand: string;
  model: string;
  fuel: string;
  transmission: string;
  drive: string;
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
  powerMin: number;
  powerMax: number;
  capacityMin: number;
  capacityMax: number;
  powerKM: string;
  capacityCM3: string;
};

export type SortOption =
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "year_asc"
  | "brand_asc"
  | "power_desc"
  | "power_asc"
  | null;

// 1. Dodano clearFilters do typu
type CarsContextType = {
  cars: Car[];
  loading: boolean;
  filters: Filters;
  pendingFilters: Filters;
  setPendingFilters: (filters: Filters) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  filteredCars: Car[];
  maxPrice: number;
  minYear: number;
  maxYear: number;
  minPower: number;
  maxPower: number;
  minCapacity: number;
  maxCapacity: number;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
};

const defaultFilters: Filters = {
  brand: "",
  model: "",
  fuel: "",
  transmission: "",
  drive: "",
  yearMin: 1900,
  yearMax: 2026,
  priceMin: 0,
  priceMax: 99999,
  powerMin: 0,
  powerMax: 1000,
  capacityMin: 0,
  capacityMax: 5000,
  powerKM: "",
  capacityCM3: "",
};

const CarsContext = createContext<CarsContextType>({
  cars: [],
  loading: true,
  filters: defaultFilters,
  pendingFilters: defaultFilters,
  setPendingFilters: () => { },
  applyFilters: () => { },
  clearFilters: () => { },
  filteredCars: [],
  maxPrice: 99999,
  minYear: 1900,
  maxYear: 2026,
  minPower: 0,
  maxPower: 1000,
  minCapacity: 0,
  maxCapacity: 5000,
  sortOption: null,
  setSortOption: () => { },
});

const getPowerKM = (powerStr: string) => {
  const match = String(powerStr).match(/(\d+)\s*KM/i);
  return match ? parseInt(match[1]) : 0;
};

const getCapacity = (powerStr: string) => {
  const match = String(powerStr).match(/(\d+)\s*cm3/i);
  return match ? parseInt(match[1]) : 0;
};

function getCachedCars() {
  if (typeof window === "undefined") return null;
  const cached = sessionStorage.getItem("cars");
  const cachedAt = sessionStorage.getItem("cars_at");
  if (cached && cachedAt && Date.now() - Number(cachedAt) < CACHE_TTL) {
    return JSON.parse(cached);
  }
  return null;
}

export function CarsProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Filters>(defaultFilters);
  const [sortOption, setSortOption] = useState<SortOption>(null);

  useEffect(() => {
    const cached = getCachedCars();
    if (cached !== null) {
      setCars(cached);
      setLoading(false);
      return;
    }

    const fetchCars = async () => {
      try {
        const res = await fetch("/api/cars");
        const data = await res.json();
        sessionStorage.setItem("cars", JSON.stringify(data));
        sessionStorage.setItem("cars_at", String(Date.now()));
        setCars(data);
      } catch (err) {
        console.error("Błąd podczas ładowania aut:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const maxPrice = useMemo(() => {
    return cars.length > 0 ? Math.max(...cars.map((c) => c.price || 0)) : 99999;
  }, [cars]);

  const minYear = useMemo(() => {
    return cars.length > 0 ? Math.min(...cars.map((c) => Number(c.year) || 2000)) : 1900;
  }, [cars]);

  const maxYear = useMemo(() => {
    return cars.length > 0 ? Math.max(...cars.map((c) => Number(c.year) || 2024)) : 2026;
  }, [cars]);

  const minPower = useMemo(() => {
    return cars.length > 0 ? Math.min(...cars.map((c) => getPowerKM(c.power))) : 0;
  }, [cars]);

  const maxPower = useMemo(() => {
    return cars.length > 0 ? Math.max(...cars.map((c) => getPowerKM(c.power))) : 1000;
  }, [cars]);

  const minCapacity = useMemo(() => {
    return cars.length > 0 ? Math.min(...cars.map((c) => getCapacity(c.power))) : 0;
  }, [cars]);

  const maxCapacity = useMemo(() => {
    return cars.length > 0 ? Math.max(...cars.map((c) => getCapacity(c.power))) : 5000;
  }, [cars]);

  // Inicjalizacja filtrów po załadowaniu aut
  useEffect(() => {
    if (cars.length === 0) return;
    const reset = { ...defaultFilters, priceMax: maxPrice, yearMin: minYear, yearMax: maxYear, powerMin: minPower, powerMax: maxPower, capacityMin: minCapacity, capacityMax: maxCapacity };
    setPendingFilters(reset);
    setFilters(reset);
  }, [cars, maxPrice, minYear, maxYear, minPower, maxPower, minCapacity, maxCapacity]);

  const applyFilters = () => setFilters({ ...pendingFilters });

  // 2. Implementacja funkcji czyszczenia
  const clearFilters = () => {
    const reset = { ...defaultFilters, priceMax: maxPrice, yearMin: minYear, yearMax: maxYear, powerMin: minPower, powerMax: maxPower, capacityMin: minCapacity, capacityMax: maxCapacity };
    setPendingFilters(reset);
    setFilters(reset);
  };

  const filteredCars = useMemo(() => {
    const filtered = cars.filter((car) => {
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.drive && car.drive !== filters.drive) return false;
      if (Number(car.year) < filters.yearMin || Number(car.year) > filters.yearMax) return false;
      if (car.price < filters.priceMin || car.price > filters.priceMax) return false;
      const powerValue = getPowerKM(car.power);
      if (powerValue < filters.powerMin || powerValue > filters.powerMax) return false;
      const capacityValue = getCapacity(car.power);
      if (capacityValue < filters.capacityMin || capacityValue > filters.capacityMax) return false;

      if (filters.powerKM && !String(car.power).includes(filters.powerKM)) return false;
      if (filters.capacityCM3 && !String(car.power).includes(filters.capacityCM3)) return false;

      return true;
    });

    if (!sortOption) return filtered;

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "price_asc": return (a.price ?? 0) - (b.price ?? 0);
        case "price_desc": return (b.price ?? 0) - (a.price ?? 0);
        case "year_desc": return (b.year ?? 0) - (a.year ?? 0);
        case "year_asc": return (a.year ?? 0) - (b.year ?? 0);
        case "brand_asc": return (a.brand ?? "").localeCompare(b.brand ?? "");
        case "power_desc": return getPowerKM(b.power) - getPowerKM(a.power);
        case "power_asc": return getPowerKM(a.power) - getPowerKM(b.power);
        default: return 0;
      }
    });
  }, [cars, filters, sortOption]);

  return (
    <CarsContext.Provider
      value={{
        cars,
        loading,
        filters,
        pendingFilters,
        setPendingFilters,
        applyFilters,
        clearFilters,
        filteredCars,
        maxPrice,
        minYear,
        maxYear,
        minPower,
        maxPower,
        minCapacity,
        maxCapacity,
        sortOption,
        setSortOption,
      }}
    >
      {children}
    </CarsContext.Provider>
  );
}

export const useCars = () => useContext(CarsContext);