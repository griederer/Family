'use client'

import { ThingsTaskList } from '@/components/tasks/ThingsTaskList'

export default function AnytimeTasksPage() {
  return <ThingsTaskList smartListType="assigned_to_me" />
}