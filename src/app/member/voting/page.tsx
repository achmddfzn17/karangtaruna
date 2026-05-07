import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Vote as VoteIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Lock,
  CalendarClock,
} from "lucide-react";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "E-Voting",
};

export default async function MemberVotingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");

  const userId = (session.user as any).id;
  const params = await searchParams;

  // Optimized: Single query to get polls with user votes
  const polls = await prisma.polling.findMany({
    where: { 
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      options: {
        include: {
          votes: {
            where: { userId },
            select: { id: true, userId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Server Action: Submit Vote with Transaction
  async function submitVote(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) redirect("/anggota/login");
    const userId = (session.user as any).id;

    const pollingId = formData.get("pollingId") as string;
    const optionId = formData.get("optionId") as string;

    if (!pollingId || !optionId) {
      redirect("/member/voting?error=Data+tidak+lengkap");
    }

    try {
      // Use transaction to prevent race condition
      await prisma.$transaction(async (tx) => {
        // Check if user already voted
        const existingVote = await tx.vote.findUnique({
          where: {
            userId_pollingId: { userId, pollingId },
          },
        });

        if (existingVote) {
          throw new Error("ALREADY_VOTED");
        }

        // Check if polling is still active and not expired
        const polling = await tx.polling.findUnique({
          where: { id: pollingId },
          select: { isActive: true, expiresAt: true },
        });

        if (!polling) {
          throw new Error("POLLING_NOT_FOUND");
        }

        if (!polling.isActive) {
          throw new Error("POLLING_INACTIVE");
        }

        if (polling.expiresAt && new Date(polling.expiresAt) < new Date()) {
          throw new Error("POLLING_EXPIRED");
        }

        // Check if option exists and belongs to this polling
        const option = await tx.pollingOption.findFirst({
          where: {
            id: optionId,
            pollingId: pollingId,
          },
        });

        if (!option) {
          throw new Error("OPTION_NOT_FOUND");
        }

        // Create vote
        await tx.vote.create({
          data: {
            userId,
            pollingId,
            optionId,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            userId,
            userName: session.user.name || session.user.email || "Unknown",
            action: "CREATE",
            module: "voting",
            targetId: pollingId,
            detail: `Memberikan suara pada voting`,
          },
        });
      });

      revalidatePath("/member/voting");
      revalidatePath("/dashboard/voting");
      revalidatePath("/dashboard");
      redirect("/member/voting?success=1");
    } catch (error: any) {
      console.error("[SUBMIT_VOTE_ERROR]", error);

      // Handle specific errors
      if (error.message === "ALREADY_VOTED") {
        redirect("/member/voting?error=Anda+sudah+memberikan+suara+pada+voting+ini");
      } else if (error.message === "POLLING_NOT_FOUND") {
        redirect("/member/voting?error=Voting+tidak+ditemukan");
      } else if (error.message === "POLLING_INACTIVE") {
        redirect("/member/voting?error=Voting+sudah+tidak+aktif");
      } else if (error.message === "POLLING_EXPIRED") {
        redirect("/member/voting?error=Voting+sudah+kadaluarsa");
      } else if (error.message === "OPTION_NOT_FOUND") {
        redirect("/member/voting?error=Pilihan+tidak+valid");
      }

      // Handle Prisma unique constraint error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          redirect("/member/voting?error=Anda+sudah+memberikan+suara+pada+voting+ini");
        }
      }

      redirect("/member/voting?error=Gagal+mengirim+suara.+Silakan+coba+lagi");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">E-Voting</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suara Anda menentukan masa depan organisasi
        </p>
      </div>

      {/* Alerts */}
      {params.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Terima kasih! Suara Anda telah berhasil direkam.
        </div>
      )}
      {params.error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {decodeURIComponent(params.error)}
        </div>
      )}

      {/* Poll List */}
      <div className="grid grid-cols-1 gap-6">
        {polls.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
            <VoteIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Tidak ada voting aktif saat ini.</p>
          </div>
        ) : (
          polls.map((poll) => {
            // Check if user has voted (from optimized query)
            const userVotedOption = poll.options.find((opt) => opt.votes.length > 0);
            const hasVoted = !!userVotedOption;

            return (
              <div
                key={poll.id}
                className={`bg-white rounded-2xl border ${
                  hasVoted ? "border-blue-100 bg-blue-50/10" : "border-slate-100"
                } shadow-sm overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {hasVoted ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Selesai Memilih
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Voting Aktif
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Dibuat: {new Date(poll.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        {poll.expiresAt && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            Berakhir:{" "}
                            {new Date(poll.expiresAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">{poll.judul}</h3>
                      {poll.deskripsi && (
                        <p className="text-sm text-slate-500 mt-1">{poll.deskripsi}</p>
                      )}
                    </div>
                  </div>

                  {hasVoted ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Pilihan Anda:
                      </p>
                      {poll.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-4 rounded-xl border flex items-center justify-between ${
                            opt.votes.length > 0
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                              : "bg-slate-50 border-slate-100 text-slate-500 opacity-60"
                          }`}
                        >
                          <span className="text-sm font-bold">{opt.label}</span>
                          {opt.votes.length > 0 && <CheckCircle2 className="w-5 h-5" />}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-6 p-3 bg-white border border-blue-100 rounded-xl">
                        <Lock className="w-4 h-4 text-blue-500" />
                        <p className="text-[11px] text-slate-500 font-medium italic">
                          Suara Anda telah terkunci dan tidak dapat diubah.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form action={submitVote} className="space-y-3">
                      <input type="hidden" name="pollingId" value={poll.id} />
                      <fieldset>
                        <legend className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                          Silakan Pilih:
                        </legend>
                        <div className="grid grid-cols-1 gap-3">
                          {poll.options.map((opt) => (
                            <label key={opt.id} className="relative cursor-pointer group">
                              <input
                                type="radio"
                                name="optionId"
                                value={opt.id}
                                required
                                className="peer sr-only"
                                aria-label={opt.label}
                              />
                              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:ring-1 peer-checked:ring-blue-600">
                                <span className="text-sm font-bold text-slate-700 peer-checked:text-blue-700">
                                  {opt.label}
                                </span>
                                <div className="w-5 h-5 rounded-full border-2 border-slate-200 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <button
                        type="submit"
                        className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                      >
                        <VoteIcon className="w-5 h-5" />
                        Kirim Suara Saya
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
