import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { useStore } from '@/store/StoreContext'
import type { Client } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'
import { ClientFormDialog } from '../components/ClientFormDialog'

export function ClientsPage({ onNotice }: { onNotice: Notice }) {
  const { db } = useStore()
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Client | null>(null)
  const clients = db.clients.filter((c) => `${c.client_name} ${c.contact_name}`.includes(query))

  return (
    <>
      <PageHeader
        title="발주처"
        description="함께 일하는 고객사와 대표 담당자를 관리하세요."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setForm({
                client_id: 0,
                client_name: '',
                contact_name: '',
                contact_email: '',
                contact_phone_number: null,
              })
            }}
          >
            <Icon name="plus" size={17} />
            발주처 등록
          </Button>
        }
      />
      <Card as="section">
        <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
          <SearchField
            containerClassName="min-w-[200px] flex-1"
            placeholder="발주처 또는 담당자 이름"
            aria-label="발주처 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-xs text-muted">총 {clients.length}곳</span>
        </div>
        <div className="grid grid-cols-3 gap-5 px-6 pb-6">
          {clients.map((c) => (
            <article
              className="rounded-xl border border-line p-6 [&_h2]:mt-5 [&_h2]:text-base [&_p]:mt-2 [&_p]:text-xs [&_p]:text-muted"
              key={c.client_id}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-canvas text-muted">
                <Icon name="building" size={25} />
              </span>
              <h2>{c.client_name}</h2>
              <p>{c.contact_name} 담당자</p>
              <div className="mt-4 flex items-center gap-2 text-xs wrap-anywhere text-muted">
                <Icon name="mail" size={16} />
                {c.contact_email}
              </div>
              <p>{c.contact_phone_number || '전화번호 미등록'}</p>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[11px] text-muted">
                <span>
                  프로젝트 {db.projects.filter((p) => p.client_id === c.client_id).length}개
                </span>
                <Button
                  variant="text"
                  size="plain"
                  onClick={() => {
                    setForm(c)
                  }}
                >
                  정보 수정 <Icon name="arrow" size={15} />
                </Button>
              </div>
            </article>
          ))}
        </div>
        {!clients.length && <Empty />}
      </Card>
      {form && <ClientFormDialog client={form} onClose={() => setForm(null)} onNotice={onNotice} />}
    </>
  )
}
