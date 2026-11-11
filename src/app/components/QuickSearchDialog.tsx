import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'
import { Modal } from '@/shared/ui/overlays/Modal'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { useStore } from '@/store/StoreContext'
import { visibleProjects } from '@/shared/domain/permissions'
import { go } from '../routing/navigation'

export function QuickSearchDialog({ onClose }: { onClose: () => void }) {
  const { db, user } = useStore()
  const [query, setQuery] = useState('')
  const projects = visibleProjects(db, user!).filter(
    (project) => query && project.project_name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Modal title="프로젝트 빠른 검색" onClose={onClose}>
      <SearchField
        containerClassName=""
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="프로젝트명을 입력하세요"
        aria-label="프로젝트명"
      />
      <div
        className={cn(
          'mt-5 [&_p]:p-5 [&_p]:text-center [&_p]:text-muted [&_small]:mt-1 [&_small]:block',
          '[&_small]:text-[11px] [&_small]:text-muted [&>button]:flex [&>button]:w-full',
          '[&>button]:items-center [&>button]:gap-4 [&>button]:border-b [&>button]:border-line',
          '[&>button]:px-2 [&>button]:py-4 [&>button]:text-left [&>button:hover]:bg-subtle',
          '[&>button>span]:flex-1 [&>button>span]:text-[13px]',
        )}
      >
        {projects.map((project) => (
          <button
            key={project.project_id}
            onClick={() => {
              go(`projects/${project.project_id}`)
              onClose()
            }}
          >
            <Icon name="folder" />
            <span>
              {project.project_name}
              <small>PRJ-{String(project.project_id).padStart(3, '0')}</small>
            </span>
            <Icon name="arrow" />
          </button>
        ))}
        {!projects.length && (
          <p>
            {query
              ? '조회 가능한 프로젝트 중 일치하는 결과가 없어요.'
              : '내가 볼 수 있는 프로젝트만 검색돼요.'}
          </p>
        )}
      </div>
    </Modal>
  )
}
