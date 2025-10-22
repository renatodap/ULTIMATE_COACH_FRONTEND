'use client'

interface Exercise {
  name: string
  muscle_groups: string[]
  sets: number
  rep_range: string
  rest_seconds: number
  rir?: number
  notes?: string
}

interface TrainingSession {
  id: string
  session_kind: string
  session_name: string
  time_of_day: string
  estimated_duration_minutes: number
  notes?: string
  state: string
  completed_at?: string | null
  exercises: Exercise[]
}

interface WorkoutCardProps {
  session: TrainingSession
  onComplete: () => void
}

export default function WorkoutCard({ session, onComplete }: WorkoutCardProps) {
  const isCompleted = !!session.completed_at

  return (
    <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h3 className="text-base font-semibold text-iron-white">
              {session.session_name || 'Training Session'}
            </h3>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-iron-gray">
            <span>⏱️ {session.estimated_duration_minutes} min</span>
            <span>🕐 {session.time_of_day}</span>
          </div>
        </div>

        {isCompleted && (
          <span className="px-2 py-1 rounded text-xs bg-green-900/30 border border-green-700 text-green-300">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="mb-3 p-2 rounded bg-iron-black/50 border border-iron-gray/30">
          <p className="text-sm text-iron-gray">{session.notes}</p>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-2">
        {session.exercises.map((exercise, idx) => (
          <div
            key={idx}
            className="p-3 rounded bg-iron-black border border-iron-gray/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-iron-white">
                  {exercise.name}
                </h4>
                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                  <p className="text-xs text-iron-gray mt-0.5">
                    {exercise.muscle_groups.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-iron-white">
                <span className="font-semibold">{exercise.sets}</span>
                <span className="text-iron-gray"> sets</span>
              </span>
              <span className="text-iron-white">
                <span className="font-semibold">{exercise.rep_range}</span>
                <span className="text-iron-gray"> reps</span>
              </span>
              <span className="text-iron-white">
                <span className="font-semibold">{exercise.rest_seconds}s</span>
                <span className="text-iron-gray"> rest</span>
              </span>
              {exercise.rir !== undefined && (
                <span className="text-iron-white">
                  <span className="font-semibold">{exercise.rir}</span>
                  <span className="text-iron-gray"> RIR</span>
                </span>
              )}
            </div>

            {exercise.notes && (
              <p className="mt-2 text-xs text-iron-gray italic">{exercise.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-3 rounded bg-iron-orange text-iron-black font-semibold hover:bg-iron-orange/90 active:scale-95 transition-all"
        >
          Mark Complete
        </button>
      )}

      {isCompleted && (
        <div className="mt-4 text-center text-sm text-green-400">
          Completed {new Date(session.completed_at!).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
