const COLUMNS = ['a_fazer', 'fazendo', 'feito']

export function groupByStatus(tasks) {
  return COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}
