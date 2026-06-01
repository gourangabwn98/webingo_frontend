import { useForm, Controller } from 'react-hook-form'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function TaskForm({ onSubmit, loading, defaultValues, members = [] }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          assignees: defaultValues.assignees?.map((u) => u._id ?? u) ?? [],
        }
      : { status: 'todo', priority: 'medium', assignees: [] },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />

      <div className="space-y-1.5">
        <label className="label">Description</label>
        <textarea
          rows={3}
          placeholder="Add more details..."
          className="input-field resize-none"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="label">Status</label>
          <select className="input-field" {...register('status')}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="label">Priority</label>
          <select className="input-field" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Due Date" type="date" {...register('dueDate')} />

        <div className="space-y-1.5">
          <label className="label">Assignees</label>
          <Controller
            name="assignees"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <select
                className="input-field"
                multiple
                style={{ height: '80px' }}
                value={field.value}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value
                  )
                  field.onChange(selected)
                }}
              >
                {members.map((m, i) => (
                  <option key={m.user?._id ?? i} value={m.user?._id}>
                    {m.user?.name}
                  </option>
                ))}
              </select>
            )}
          />
          <p className="text-xs text-slate-600">Hold Ctrl/Cmd to select multiple</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {defaultValues ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}