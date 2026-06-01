import { useForm } from 'react-hook-form'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function ProjectForm({ onSubmit, loading, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        placeholder="My Awesome Project"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <div className="space-y-1.5">
        <label className="label">Description</label>
        <textarea
          placeholder="What is this project about?"
          rows={3}
          className="input-field resize-none"
          {...register('description')}
        />
      </div>
      <div className="space-y-1.5">
        <label className="label">Status</label>
        <select className="input-field" {...register('status')}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{defaultValues ? 'Update Project' : 'Create Project'}</Button>
      </div>
    </form>
  )
}