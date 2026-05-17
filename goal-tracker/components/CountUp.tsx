'use client';
import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function CountUp({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [val, setVal] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (v) => setVal(v));
    return unsubscribe;
  }, [value, spring, display]);

  return <span>{val}</span>;
}
