## Frontend Stack & Structure
- Framework: Next.js 16 (App Router, Turbopack), TypeScript
- Styling: Tailwind + 커스텀 CSS 변수(핑크/파스텔 테마), glassmorphism 카드
- Fonts: Geist Sans/Mono
- State & Data:
  - API fetch 래퍼: `/lib/api.ts`
  - 타입 정의: `/lib/types.ts`
- UI 컴포넌트:
  - 카드/버튼/배지/입력 등: `/components/ui/*`
  - 코드 에디터: `/components/ui/CodeEditor.tsx`
- 도메인 컴포넌트:
  - 함수 생성 폼: `/components/forms/FunctionForm.tsx`
  - 함수 목록: `/components/lists/FunctionList.tsx`
  - 사이드바 함수 바로가기: `/components/sidebar/RecentFunctions.tsx`
- 페이지:
  - 메인(함수 개요/생성/목록): `/app/page.tsx`
  - 함수 상세(코드/실행/히스토리/메트릭): `/app/functions/[id]/page.tsx`
  - 글로벌 레이아웃/사이드바: `/app/layout.tsx`

## API Endpoints (사용 중)
- GET `/api/functions` : 함수 목록 (커서 기반)
- POST `/api/functions` : 함수 생성
- DELETE `/api/functions/{functionId}` : 함수 삭제
- GET `/api/functions/{functionId}` : 함수 상세 + 실행 이력(커서)
- PUT `/api/functions/{functionId}/code` : 코드 수정/새 버전
- POST `/api/executions/{functionId}/invoke` : 함수 실행 요청

## UX 컨셉
- 핑크·파스텔 그라데이션, 둥근 카드, 부드러운 호버/쉐도우
- 로딩: 오버레이 + 게이지바 + GIF(`/public/loading/create.gif`, `/public/loading/loading.gif`, `/public/loading/start.gif`)
- 시간 표기는 KST(+9h)로 보정 표시
- 최근 함수 바로가기(사이드바)와 함수 목록 카드의 톤/배지 스타일 통일

## 빌드/실행
- Dev: `npm run dev`
- Build: `npm run build`
- Public assets for 로딩 GIF: `public/loading/` 디렉터리에 `create.gif`, `loading.gif`, `start.gif` 배치
