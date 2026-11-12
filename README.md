# Prompt Workspace · dbp-t2_FE

프람트테크놀로지 브랜드를 적용한 프로젝트·인력·평가 관리 프론트엔드입니다. 팀 2의 최신 공유 시트(2026-11-10 검토), ERD v1.5와 SQL 가상 데이터를 기준으로 구성했습니다.

사이트: [dbp-t2-fe.vercel.app](https://dbp-t2-fe.vercel.app)

GitHub main 브랜치에 푸시하면 Vercel에서 자동 배포합니다. 설치 `npm ci`, 빌드 `npm run build`, 출력 폴더 `dist`를 사용합니다.

## 실행

Node.js 24 LTS 이상과 npm을 사용합니다.

```bash
npm ci
npm run dev
```

터미널에 표시되는 주소를 여세요. 기본 주소는 `http://localhost:5173`입니다.

```bash
npm run build   # TypeScript 검사 + dist 빌드
npm run lint    # Oxlint
npm test        # 업무 규칙 테스트
npm run preview
```

`dist`는 `npm run build`로 자동 생성되는 배포 폴더이며 삭제해도 다시 만들 수 있습니다. `npm run preview`는 빌드 후 실행하세요.

## 사용 흐름

첫 방문은 로그인 화면입니다. 직원 회원가입에서 경영진·PM·일반 직원 유형을 선택하고 ID 중복 확인, 비밀번호 확인, 직원 정보를 입력합니다. 가입 후 사번이 자동 발급되며 업무 현황으로 이동합니다. 학력은 5개 선택지로 통일했고 주민번호는 앞 6자리·뒤 7자리와 생년월일 형식을 검사합니다. PM으로 가입해도 프로젝트별 관리·평가 권한은 해당 프로젝트에 PM으로 배정돼야 적용됩니다.

- 업무 현황: 날짜별 프로젝트·투입 인원, 현재 미투입 인원, 고객평가 보고 대기, 연간 타임라인
- 프로젝트: 검색·기간 필터, 등록·수정·종료, 구성원 추가·실제 투입기간 기록, 고객평가 의뢰·회수·보고
- 직원 디렉터리: 경영진 전용 조건 AND 검색, 상세 경력, 기술·경험, 평가 기초자료
- 투입 이력: 경영진 전체 / 일반 직원 본인 조회, 기준일·기간·역할 필터와 CSV
- 프로젝트 평가: 고객·PM·동료평가, 점수·의견 검증, 중복·자기평가 제한, 권한별 결과 검색·CSV
- 발주처: 대표 담당자 한 명의 연락처 관리
- 내 프로필: 학력·총 경력·기술 설명·비밀번호 수정

## 현재 구현 범위

현재는 백엔드 API가 연결되지 않은 프론트엔드입니다. 업무 데이터와 신규 계정은 localStorage, 로그인 상태는 sessionStorage에 저장합니다. 회원가입한 계정은 같은 브라우저에서 다시 로그인할 수 있습니다.

주민번호 원문은 폼 검증에만 사용하고 저장소에는 앞 6자리와 마스킹 값만 남깁니다. 실제 본인인증·주민번호 암호화·DB 저장은 백엔드에서 구현해야 합니다. 비밀번호는 Web Crypto PBKDF2(무작위 salt, SHA-256, 100,000회)로 변환해 저장하며, API 연결 시에는 합의된 JWT 인증으로 교체합니다. 개발 환경은 localhost 또는 HTTPS에서 실행하세요.

개발 시 기존 SQL 관계를 확인할 계정은 demo01(경영진), demo05(프로젝트 2·4 PM), demo02(일반 직원)이며 초기 비밀번호는 demo1234입니다. 화면에 체험 로그인이나 계정 전환 기능은 제공하지 않습니다.

파일이나 원본 DB를 변경하지 않으며, 이메일 발송·인센티브 자동 계산·실제 DB 연동은 없습니다. 여러 탭에서 동시에 수정하거나 여러 사용자 간 데이터를 공유하는 기능은 제공하지 않습니다.

## 코드 구조

```text
src/
  app/
    App.tsx             # 앱 시작·상태 Provider
    routing/            # 주소와 페이지 연결
    layout/             # 헤더·계정 메뉴·전체 배치
    components/         # 앱 전체 빠른 검색
  features/
    projects/           # 다른 업무도 아래와 같은 구조
      pages/            # 페이지 구성과 화면 전환
      components/       # 검색·목록·상세·입력 대화상자
    auth/
      pages/
      components/
      hooks/            # 로그인·회원가입 상태와 제출
      model/            # 필드 검증·입력 타입
    evaluations/
      pages/
      components/
      hooks/            # 평가 검색 상태와 조회 조건
      utils/            # 평가 CSV 만들기
    dashboard/          # 업무 현황
    employees/          # 직원·내 프로필
    assignments/        # 투입 이력
    clients/            # 발주처
  shared/
    ui/
      actions/          # 버튼·탭·아이콘
      forms/            # 입력·검색·필터·폼 하단 버튼
      data/             # 표·인물 표시·통계·정보 목록
      feedback/         # 배지·빈 목록·오류 안내
      overlays/         # 공통 대화상자
      layout/           # 카드·제목
      brand/            # 로고·브랜드 그래픽
    model/              # DB 타입·표시용 코드명
    domain/             # 권한·투입·평가 업무 규칙
    lib/                # 날짜·CSV·Tailwind 클래스 병합
  store/                # 데모 상태·변경 처리·브라우저 저장
  styles/
    index.css           # Tailwind 진입점
    theme.css           # 브랜드 색·글꼴·그림자
    base.css            # 브라우저 기본값·접근성
  assets/               # 로고·파비콘
  data/seed.json        # 제공 SQL의 가상 데이터
```

`main.tsx → app/App.tsx → app/layout/Workspace.tsx → app/routing/AppRoutes.tsx` 순서로 시작하세요. 이후 해당 업무의 `pages`에서 화면 구성을 보고, 같은 업무의 `components`에서 필요한 카드·표·폼을 찾으면 됩니다. 여러 단계의 `../../../` 대신 `@/shared/...`처럼 `src` 기준 경로를 사용합니다.

데이터 변경은 `화면 → useStore() → store/useDemoStore.ts → store/mutations.ts → shared/domain/검증 → browserStorage.ts`를 따릅니다. 회원가입의 저장·중복 확인은 store/registration.ts에서 담당합니다. 업무 규칙은 UI와 분리되어 있고 기존 브라우저 저장 키와 데이터 형식도 유지합니다.

## Tailwind 스타일 작성

[Tailwind의 Vite 플러그인](https://tailwindcss.com/docs/installation/using-vite)을 사용합니다. 화면 스타일은 해당 TSX의 유틸리티 클래스로 작성합니다. 전역 CSS에는 기본 설정만 두고, `components.css`처럼 모든 화면을 모은 파일은 만들지 않습니다.

- 브랜드 색 변경: `styles/theme.css`의 `--color-brand` 등 수정
- 버튼·입력·표 변경: `shared/ui`의 해당 공통 컴포넌트 수정
- 특정 업무의 배치 변경: 해당 `features/*/components` 수정
- 페이지 추가: 해당 업무의 `pages`에 만들고 `app/routing/AppRoutes.tsx`에 연결
- 상태·검증 로직이 길어지면 같은 업무의 `hooks` 또는 `utils`로 분리

`bg-brand`, `text-muted`, `border-line` 같은 이름으로 디자인 값을 공유합니다. 조건부 클래스는 `cn()`과 완전한 클래스 문자열을 사용합니다. 반복 UI는 컴포넌트로 묶고, 긴 클래스 목록은 `cn()` 안에서 줄을 나눕니다.

```bash
npm run format        # 코드 형식과 Tailwind 클래스 순서 자동 정리
npm run format:check  # 형식 확인
npm run lint          # 코드 검사
npm test              # 업무 규칙·상태 변경 테스트
npm run build         # TypeScript 검사와 배포 빌드
```

## 브랜드 디자인

공식 로고와 빨간색을 적용했습니다. 데스크톱 전용으로 최소 화면 너비 1,200px을 기준으로 설계했습니다. 헤더에 업무 메뉴를 배치하고 다열 카드·표·입력 폼을 유지하며, 노트북과 큰 모니터의 너비에 맞춰 여백을 조정합니다. 대시보드와 로그인 화면에 같은 디자인을 적용했습니다. 로고는 [프람트 공식 홈페이지](https://www.promptech.co.kr/)의 원본을 사용하고, 주 색상은 `#E60421`입니다.

대시보드는 핵심 수치·진행 프로젝트·할 일을 우선 표시합니다. 연간 일정과 투입 현황, 목록의 상세 검색은 펼쳐서 확인할 수 있습니다. 내 프로필·로그아웃은 헤더 오른쪽 계정 메뉴에서 이용합니다.

## 팀 검토 자료

- [요구사항 분석·자료 검토 기록](docs/REQUIREMENTS.md)
- [백엔드 API 명세](docs/API_SPEC.md): 5개 테이블 기준 · 경로·입력·응답·권한

원격 저장소: https://github.com/Database-Project-Team2/dbp-t2_FE
