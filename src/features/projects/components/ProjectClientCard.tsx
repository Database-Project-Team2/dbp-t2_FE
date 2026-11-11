import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import type { Client } from '@/shared/model/entities'

export function ProjectClientCard({ client }: { client: Client }) {
  return (
    <Card as="section" className="flex flex-col">
      <SectionHeading>
        <h2>발주처 담당자</h2>
        <Icon name="building" />
      </SectionHeading>
      <div
        className={cn(
          'flex-1 px-6 pb-6 [&_h3]:mt-3 [&_p]:mt-2 [&_p]:mb-4 [&_p]:text-xs [&_p]:text-muted',
          '[&>div]:mt-2 [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:text-xs',
          '[&>div]:text-secondary',
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas bg-violet-50 text-muted text-violet-500">
          <Icon name="building" size={27} />
        </span>
        <h3>{client.client_name}</h3>
        <p>{client.contact_name} 담당자</p>
        <div>
          <Icon name="mail" size={16} />
          {client.contact_email}
        </div>
        <div>{client.contact_phone_number || '전화번호 미등록'}</div>
      </div>
      <div className="border-t border-line px-6 py-3.5 text-[11px] text-muted">
        고객평가의 실제 평가자는 현재 대표 담당자예요.
      </div>
    </Card>
  )
}
