import {
  IonApp,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'

function App() {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>CasePilot</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8 px-6 py-12 md:px-10">
            <section className="grid gap-8 rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl md:grid-cols-[1.4fr_1fr] md:items-center md:px-12">
              <div>
                <IonBadge color="primary">React + Vite + Ionic</IonBadge>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
                  Una base sólida para tu próximo caso.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                  El proyecto está listo para crecer con componentes Ionic,
                  estilos utilitarios de Tailwind y una experiencia de desarrollo
                  rápida con Vite.
                </p>
                <IonButton className="mt-7" href="https://vite.dev/" target="_blank">
                  Explorar Vite
                </IonButton>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-medium text-slate-300">UI</p>
                  <p className="mt-2 text-2xl font-semibold">Ionic React</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Componentes accesibles y adaptables para web y móvil.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-medium text-slate-300">Estilos</p>
                  <p className="mt-2 text-2xl font-semibold">Tailwind CSS</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Utilidades listas para construir interfaces consistentes.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <IonCard className="m-0">
                <IonCardHeader>
                  <IonCardSubtitle>Frontend</IonCardSubtitle>
                  <IonCardTitle>React 19</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Componentes modernos con TypeScript y recarga instantánea.
                </IonCardContent>
              </IonCard>

              <IonCard className="m-0">
                <IonCardHeader>
                  <IonCardSubtitle>Tooling</IonCardSubtitle>
                  <IonCardTitle>Vite 8</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Desarrollo local rápido y builds optimizados para producción.
                </IonCardContent>
              </IonCard>

              <IonCard className="m-0">
                <IonCardHeader>
                  <IonCardSubtitle>Backend local</IonCardSubtitle>
                  <IonCardTitle>Supabase</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  La configuración local se encuentra en la carpeta supabase.
                </IonCardContent>
              </IonCard>
            </section>
          </main>
        </IonContent>
      </IonPage>
    </IonApp>
  )
}

export default App
