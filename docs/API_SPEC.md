# 팀 2 API 명세

수정일: 2026-11-12 · 프론트엔드 연동용 초안 · 기준: ERD v1.5의 5개 테이블과 현재 화면

## 공통

- 기본 경로: `/api/v1`. 아래 표에는 기본 경로를 생략했습니다.
- JSON 필드명은 DB와 같은 `snake_case`, ID는 정수, 날짜는 `YYYY-MM-DD`입니다.
- GET의 입력은 query, POST/PATCH의 입력은 JSON body입니다. `{id}`는 경로 변수입니다.
- 성공 응답: 단건 `{ data, meta }`, 목록 `{ data: [], page, meta }`. `meta`에는 request_id와 timestamp를 넣습니다.
- 목록: `page=0`, `size=20` 기본값, 최대 100건. `page`에는 page/size/total_elements/total_pages/has_next를 반환합니다.
- 생성은 201, 조회·수정은 200, 로그아웃·비밀번호 변경은 본문 없이 204입니다.
- PATCH는 보낸 필드만 수정합니다. `?`는 선택 입력, `null`은 nullable 필드만 비울 수 있습니다.
- 아래 응답 열은 `data`에 담기는 내용입니다. 모든 검색·조회·내보내기에 서버 권한 검사를 적용합니다.

## 인증

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 로그인 | POST `/auth/login` | login_id, password | access_token, employee, is_pm, server_today | 공개 |
| 로그아웃 | POST `/auth/logout` | 없음 | 204 | 로그인 사용자 |
| 내 로그인 정보 | GET `/auth/me` | 없음 | employee, is_pm, server_today | 로그인 사용자 |
| ID 중복 확인 | GET `/auth/check-login-id` | login_id | login_id, available | 공개 |

- JWT 인증을 사용합니다. 로그인·회원가입 성공 응답의 `data.access_token`을 프론트가 보관하며, 토큰은 발급 시점부터 12시간 동안 유효합니다. 퇴사자는 로그인할 수 없습니다.
- 인증이 필요한 모든 요청(GET·CSV 다운로드 포함)에 `Authorization: Bearer <access_token>` 헤더를 보냅니다. 서버는 토큰을 검증하고 요청별 권한을 확인합니다.
- 로그아웃은 프론트가 토큰과 로그인 상태를 삭제하면 완료됩니다. `POST /auth/logout`은 본문 없이 204만 반환하는 형식상 API이며, 서버에서 토큰을 폐기하지 않습니다. API 호출 실패 여부와 무관하게 프론트는 토큰을 삭제합니다.
- 비밀번호 변경 성공 후 프론트는 토큰과 로그인 상태를 삭제하고 로그인 화면으로 이동합니다. 인증이 필요한 요청에서 토큰 누락·만료·검증 실패로 401을 받아도 동일하게 처리합니다.
- 로그아웃·비밀번호 변경으로 이미 발급된 토큰이 무효화되지는 않습니다. 다른 기기나 복사본에 남은 토큰도 원래 만료 시각까지 유효하며, 비밀번호 변경 후 재로그인은 현재 프론트의 토큰 삭제로만 처리합니다.

## 1. 직원 — EMPLOYEE

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 회원가입 | POST `/employees` | 아래 가입 필드 | access_token, employee, is_pm, server_today | 공개 |
| 직원 검색 | GET `/employees` | employee_name?, employee_no?, job_category?, employment_status?, assigned?, min_career_months?, skill? | 직원 목록 + current_assignment_count | 경영진 |
| 직원 상세 | GET `/employees/{employee_id}` | 없음 | 직원 정보 | 경영진 또는 본인 |
| 내 정보 수정 | PATCH `/employees/me` | education?, total_career_months?, skill_description? | 수정된 직원 정보 | 본인 |
| 비밀번호 변경 | PATCH `/employees/me/password` | current_password, new_password | 204, 프론트 토큰 삭제 후 재로그인 | 본인 |
| 개인 경력 | GET `/employees/{employee_id}/career` | project_id?, project_role?, as_of?, from?, to?, ongoing_projects_only? | 프로젝트별 역할·투입 이력 | 경영진 또는 본인 |
| 경력 다운로드 | GET `/employees/{employee_id}/career.csv` | 개인 경력과 같은 필터 | CSV | 경영진 또는 본인 |

**가입 필드:** employee_name, login_id, password, resident_no, education, hire_date, total_career_months, job_category, system_role, skill_description?. 비밀번호 확인은 프론트에서 검사하고 요청에서는 제외합니다.

**직원 응답:** employee_id, employee_no, employee_name, education, employment_status, hire_date, resignation_date, total_career_months, skill_description, job_category, login_id, system_role, resident_no_masked.

- 사번은 서버가 입사연도 + 4자리 순번으로 발급합니다. 가입 시 MANAGEMENT(경영진), PM, EMPLOYEE(일반 직원)를 선택합니다. PM의 프로젝트별 수정·평가 권한은 해당 프로젝트의 PM 배정으로 판단합니다.
- 비밀번호 해시·주민번호 원문/암호화값은 응답하지 않습니다. 주민번호는 앞 6자리만 남긴 `YYMMDD-*******` 형식으로 응답합니다.
- 학력은 고졸 / 전문대졸(초대졸) / 대졸(학사) / 석사 / 박사 중 하나입니다. 주민번호는 앞 6자리·뒤 7자리, 실제 생년월일·세기 구분을 검사하며 본인인증을 의미하지 않습니다.
- login_id는 대소문자를 구분하지 않고 가입 시 중복을 다시 확인합니다. 기술 검색은 `skill=Java&skill=SQL`처럼 여러 키워드를 AND로 적용합니다.

## 2. 발주처 — CLIENT

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 발주처 검색 | GET `/clients` | query? — 회사명 또는 담당자명 | 발주처 목록 | 경영진 |
| 발주처 상세 | GET `/clients/{client_id}` | 없음 | 발주처 정보 | 경영진 |
| 발주처 등록 | POST `/clients` | client_name, contact_name, contact_email, contact_phone_number? | 생성된 발주처 | 경영진 |
| 발주처 수정 | PATCH `/clients/{client_id}` | 등록 필드 중 변경할 값 | 수정된 발주처 | 경영진 |

응답은 등록 필드에 client_id를 추가합니다. 대표 담당자는 한 명이며, 변경 이력은 저장하지 않습니다. 일반 직원은 참여 프로젝트 상세에서 해당 발주처 연락처만 확인합니다.

## 3. 프로젝트 — PROJECT

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 목록·검색 | GET `/projects` | project_name?, client_name?, status?, as_of?, from?, to? | 프로젝트 목록 | 경영진 전체 / 직원 본인 실제 참여 |
| 상세 | GET `/projects/{project_id}` | 없음 | 프로젝트 + 발주처 + 본인 역할 + permissions + 고객평가 집계 | 경영진 또는 실제 참여자 |
| 등록 | POST `/projects` | project_name, client_id, actual_start_date, planned_end_date | 생성된 프로젝트 상세 | 경영진 |
| 수정 | PATCH `/projects/{project_id}` | 등록 필드 중 변경할 값 | 수정된 프로젝트 상세 | 경영진 또는 해당 PM |
| 종료 | POST `/projects/{project_id}/close` | actual_end_date | project, closed_member_ids | 경영진 또는 해당 PM |
| 수정용 발주처 선택 | GET `/projects/{project_id}/client-options` | client_name? | client_id, client_name 목록 | 경영진 또는 해당 PM |
| 고객평가 단계 기록 | PATCH `/projects/{project_id}/customer-evaluation` | step, processed_date | 처리 날짜·workflow_status·participant_count·received_count | 해당 PM |
| 업무 현황 | GET `/dashboard` | as_of? | metrics, ongoing_projects, tasks 등 | 로그인 사용자, 본인 조회 범위 |

**프로젝트 기본 응답:** project_id, project_name, client_id, actual_start_date, planned_end_date, actual_end_date, evaluation_requested_date, evaluation_received_date, evaluation_reported_date.

목록에는 status, workflow_status, client(이름·ID), member_count, current_member_count를 추가합니다. 상세에는 client 연락처, my_membership, permissions, customer_evaluation_progress(참여자 수·고객평가 등록 수)를 추가합니다.

- 실제 착수일 ≤ 오늘, 예정 종료일 ≥ 착수일. 예정일이 지나도 실제 종료 전에는 진행 중입니다.
- 종료 시 아직 끝나지 않은 실제 투입 구성원의 종료일도 함께 저장합니다. 투입 전 구성원은 유지합니다.
- 고객평가 step: `REQUEST → RECEIVE → REPORT`. 의뢰 후 실제 참여자 전원의 고객평가가 있어야 회수할 수 있습니다. 이메일 발송 기능은 아닙니다.
- 대시보드는 진행 프로젝트 수, 투입 인원(중복 제거), 미투입 직원 수, 고객평가 보고 대기를 반환합니다. 타 직원 인원 지표는 경영진만 조회합니다.

## 4. 프로젝트 구성원·투입 이력 — PROJECT_MEMBER

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 구성원 목록 | GET `/projects/{project_id}/members` | as_of? | 구성원 + 직원 이름·사번·직군 | 경영진 또는 실제 참여자 |
| 추가 가능한 직원 | GET `/projects/{project_id}/member-candidates` | employee_name?, job_category? | ACTIVE·해당 프로젝트 미등록 직원 목록 | 경영진 또는 해당 PM |
| 구성원 추가 | POST `/projects/{project_id}/members` | employee_id, project_role, assignment_start_date?, assignment_end_date? | 생성된 구성원 | 경영진 또는 해당 PM |
| 투입기간 수정 | PATCH `/members/{member_id}/assignment` | assignment_start_date?, assignment_end_date? | 수정된 구성원 | 경영진 또는 해당 PM |
| 투입 이력 검색 | GET `/assignments` | employee_name?, employee_id?, project_id?, project_role?, as_of?, from?, to?, ongoing_projects_only? | 구성원 + 직원 요약 + 프로젝트 | 경영진 전체 / 직원 본인 실제 투입 |
| 이력 다운로드 | GET `/assignments/export.csv` | 투입 이력과 같은 필터 | CSV | 이력 조회와 동일 |

**구성원 기본 응답:** member_id, project_id, employee_id, project_role, assignment_start_date, assignment_end_date. 조회에는 employee 요약과 assignment_status를 추가합니다.

- 같은 직원은 한 프로젝트에 한 번만 등록합니다. 최초 역할은 고정이며 종료 후 재투입은 지원하지 않습니다.
- 시작일이 null이면 투입 전입니다. 실제 시작일은 입사일·프로젝트 착수일 이상, 종료일은 시작일 이상이며 실제 날짜는 오늘 이하여야 합니다.
- 종료된 프로젝트·종료된 투입기간은 수정할 수 없습니다. 신규·변경 투입은 ACTIVE 직원만 가능합니다.
- 기준일 검색은 시작·종료일 당일을 포함합니다. 기간 검색은 겹치는 구간을 찾고, null 종료일은 열린 구간으로 처리합니다.

## 5. 평가 — EVALUATION

| 기능 | 메서드·경로 | 입력 | 응답 | 권한 |
| --- | --- | --- | --- | --- |
| 평가 가능한 프로젝트 | GET `/evaluations/eligible-projects` | 없음 | 종료된 본인 참여 프로젝트 + 허용 평가 유형 | 실제 참여자 |
| 평가 대상 선택 | GET `/projects/{project_id}/evaluation-options` | evaluation_type | available_targets, evaluator, can_submit, blocked_reason 등 | 실제 참여자, 유형별 역할 검사 |
| 평가 등록 | POST `/evaluations` | 아래 평가 필드 | evaluation_id, project_id, target_member_id, evaluation_type, evaluated_date | 동료: 실제 참여자 / 고객·PM: 해당 PM |
| 결과 검색 | GET `/evaluations` | target_employee_name?, target_employee_id?, project_id?, evaluation_type?, from?, to? | 평가 결과 목록 | 경영진 전체 / PM 본인 작성·등록 |
| 결과 상세 | GET `/evaluations/{evaluation_id}` | 없음 | 점수·의견·평가자·등록자 | 결과 조회 범위와 동일 |
| 결과 다운로드 | GET `/evaluations/export.csv` | 결과 검색과 같은 필터 | CSV | 결과 조회 범위와 동일 |

**평가 등록 필드:** target_member_id, evaluation_type, evaluated_date, work_performance_score, work_performance_comment, communication_score, communication_comment. 전부 필수입니다.

**평가 결과:** 등록 필드 + evaluation_id, project_id, evaluator_member_id, registered_by_member_id, project_name, target(직원 요약), evaluator(실제 평가자), registered_by(등록 직원 요약).

| 유형 | 평가·등록 주체 | 대상 |
| --- | --- | --- |
| CLIENT | 고객 담당자가 평가, 해당 PM이 입력 | 실제 참여자 전체, PM 자신도 가능 |
| PM | 해당 PM | 실제 참여자 중 PM 제외 |
| PEER | 실제 참여 직원 | 본인을 제외한 실제 참여자 |

- 프로젝트 실제 종료 후 평가합니다. 점수는 각각 정수 1~5, 두 의견은 공백 없이 필수입니다.
- 등록자와 내부 평가자는 로그인 정보로 서버가 결정합니다. CLIENT의 evaluator_member_id는 null입니다.
- 내부 평가는 같은 대상·유형·평가자 조합 중복 금지, CLIENT는 대상당 한 번입니다. CLIENT 중복은 SQL의 nullable UNIQUE만으로 막을 수 없어 서버에서도 검사해야 합니다.
- 고객평가는 의뢰일 이후 등록하고 보고 후에는 추가하지 않습니다. 회수일은 모든 고객평가일 이상이어야 합니다.
- 일반 직원은 동료평가를 작성할 수 있지만 평가 결과 목록·상세·CSV는 조회할 수 없습니다.

## 공통 코드·오류

| 구분 | 값 |
| --- | --- |
| 시스템 권한 | MANAGEMENT / PM / EMPLOYEE — PM 가입 유형과 프로젝트별 PM 배정은 구분 |
| 재직 상태 | ACTIVE / ON_LEAVE / RESIGNED |
| 직군 | DEVELOPER / MARKETING / BUSINESS_ADMIN / RESEARCH |
| 프로젝트 역할 | PM / PL / ANALYST / DESIGNER / PROGRAMMER / TESTER |
| 프로젝트 상태 | NOT_STARTED / IN_PROGRESS / CLOSED — 기준일에 따라 계산 |
| 고객평가 상태 | NOT_REQUESTED / COLLECTING / AWAITING_REPORT / REPORTED |
| 투입 상태 | NOT_ASSIGNED / ASSIGNED / ENDED |

오류 형식: `{ "error": { "code": "MEMBER_DUPLICATED", "message": "이미 등록된 직원입니다.", "field_errors": [] }, "meta": { ... } }`

| HTTP | 의미 |
| --- | --- |
| 400 | 필수값·자료형·범위 등 요청 형식 오류 |
| 401 | 로그인 실패 또는 인증 토큰 누락·만료·검증 실패 |
| 403 | 인증된 사용자의 요청 권한 부족 |
| 404 | 대상 없음 또는 조회 범위 밖 |
| 409 | 중복 등록, 종료된 데이터 수정, 평가 단계 충돌 |
| 422 | 날짜 관계 등 업무 조건 위반 |
| 429 / 500 | 요청 제한 / 서버 오류 |

## 팀 확인 사항

- 이 문서는 구현 전 초안입니다. 현재 사이트에는 백엔드 API가 연결되어 있지 않습니다.
- 주민번호 입력·형식 검사는 프론트에 반영했습니다. 현재 브라우저에는 마스킹 값만 남깁니다. API 연결 시 원문을 HTTPS 요청으로 보내고, 서버에서 암호화해 SQL의 resident_no_encrypted에 저장해야 합니다.
- 2026-11-12 요청에 따라 가입 유형에 PM을 추가했습니다. 기존 SQL·공유 시트의 system_role은 MANAGEMENT/EMPLOYEE만 허용하므로 서버 코드·DB 제약도 함께 조정해야 합니다. is_pm은 PM 가입 유형 또는 PM 배정 이력으로 계산하되 프로젝트별 권한은 배정으로 검사합니다.
- JWT 인증·12시간 만료·프론트 토큰 삭제에 의한 로그아웃 및 재로그인은 협의된 방식입니다. 실제 투입 시작 전 PM의 관리 권한은 팀 확정이 필요합니다.
- CSV는 목록과 같은 권한·조건의 전체 결과를 내보내며 page/size를 받지 않습니다.
