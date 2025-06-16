'use client'

import { ThingsTaskList } from '@/components/tasks/ThingsTaskList'

export default function OverdueTasksPage() {
  return <ThingsTaskList smartListType="overdue" />
}