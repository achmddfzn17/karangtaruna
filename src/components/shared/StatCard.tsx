"use client";

import * as React from "react";
import Link from "next/link";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  iconBg?: string;
  href?: string;
  className?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  React.useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration: 1.2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, value, motionValue]);

  React.useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString("id-ID");
      }
    });
    return unsubscribe;
  }, [motionValue]);

  return <span ref={ref}>0</span>;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  iconBg = "bg-primary/10",
  href,
  className,
}: StatCardProps) {
  const isNumeric = typeof value === "number";
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  const cardContent = (
    <div
      className={cn(
        "bg-card rounded-xl border border-border card-shadow-md p-6 transition-all duration-200",
        href && "hover:card-shadow-lg hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {isNumeric ? (
              <AnimatedNumber value={value as number} />
            ) : (
              value
            )}
          </p>
        </div>

        <div
          className={cn(
            "flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl",
            iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {/* Trend + description */}
      <div className="flex items-center gap-2 flex-wrap">
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5",
              isPositiveTrend && "text-success bg-success/10",
              isNegativeTrend && "text-destructive bg-destructive/10",
              trend === 0 && "text-muted-foreground bg-muted"
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="h-3 w-3" />
            ) : isNegativeTrend ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
