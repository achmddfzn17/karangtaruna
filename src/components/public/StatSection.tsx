"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Users, Calendar, BookOpen, Clock } from "lucide-react";

interface StatSectionProps {
  statsData: {
    anggota: number;
    kegiatan: number;
    program: number;
    tahun: number;
  };
}
function CountUp({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const display = useTransform(springVal, (v) =>
    Math.round(v).toLocaleString("id-ID")
  );

  // Trigger on inView
  if (inView) {
    motionVal.set(value);
  }

  return (
    <span>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function StatSection({ statsData }: StatSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const dynamicStats = [
    {
      icon: Users,
      value: statsData.anggota,
      suffix: "",
      label: "Anggota Aktif",
      description: "Pemuda berdedikasi yang terdaftar",
    },
    {
      icon: Calendar,
      value: statsData.kegiatan,
      suffix: "",
      label: "Kegiatan",
      description: "Program dan acara telah dilaksanakan",
    },
    {
      icon: BookOpen,
      value: statsData.program,
      suffix: "",
      label: "Program Unggulan",
      description: "Bidang pemberdayaan masyarakat",
    },
    {
      icon: Clock,
      value: statsData.tahun,
      suffix: " Thn",
      label: "Tahun Berdiri",
      description: "Melayani masyarakat dengan tulus",
    },
  ];

  return (
    <section ref={ref} className="py-20 md:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-lg shadow-blue-500/20">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {dynamicStats.map(({ icon: Icon, value, suffix, label, description }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Divider for desktop */}
                {i > 0 && (
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-blue-500" />
                )}

                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <div className="text-4xl md:text-5xl font-extrabold text-white leading-none mb-3">
                  <CountUp value={value} suffix={suffix} inView={inView} />
                </div>

                <div className="text-[15px] font-bold text-white mb-1">
                  {label}
                </div>
                <div className="text-[12px] text-blue-200">{description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
