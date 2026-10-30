<template>
  <footer class="app-footer">
    <div class="container app-footer__inner">
      <p>
        <strong>Kirjavõlu</strong> · Väikesed maagilised hetked sinu lapsele.
      </p>
      <p class="muted">
        Tekstid koostatakse sinu brauseris käsitsi kirjutatud mallidest. Andmed jäävad sinu seadmesse.
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  margin-top: 3rem;
  border-top: 1px solid var(--line);
  background: var(--bg-deep);
  font-size: 0.9rem;
}
.app-footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  padding-block: 1.5rem;
  p {
    margin: 0;
  }
}
</style>
