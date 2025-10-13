/**
 * Exercise Details List Component
 *
 * Displays exercise breakdown for strength training activities
 * Collapsible list showing sets, reps, weight, RPE
 */

import type { Exercise } from '@/lib/types/activities'

interface ExerciseDetailsListProps {
  exercises: Exercise[]
}

export default function ExerciseDetailsList({ exercises }: ExerciseDetailsListProps) {
  if (!exercises || exercises.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 bg-iron-black rounded-lg text-sm"
        >
          <div className="flex-1">
            <p className="font-medium text-iron-white">{exercise.name}</p>
            <p className="text-xs text-iron-gray">
              {exercise.sets} sets × {exercise.reps} reps
              {exercise.weight_kg && ` @ ${exercise.weight_kg}kg`}
              {exercise.rpe && ` • RPE ${exercise.rpe}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
