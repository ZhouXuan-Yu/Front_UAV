<script setup lang="ts">
</script>

<template>
  <section class="relative py-36 overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 z-0">
      <video
        class="object-cover w-full h-full"
        autoplay
        loop
        muted
        playsinline
      >
        <source src="@/assets/videos/file.mp4" type="video/mp4" />
      </video>
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
    </div>
    
    <div class="container-narrow relative z-10">
      <h2
        class="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 text-white"
        data-aos="fade-up"
      >
        Mission-ready. Day or night.
      </h2>
      <p
        class="text-xl md:text-2xl text-center max-w-4xl mx-auto text-white"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Skydio drone programs help even the most dangerous work get done safer, smarter, and faster through remote autonomous flight. From Drone as First Responder to automated inspection and site security, Skydio helps you get the intelligence you need to make the best decisions.
      </p>
    </div>
  </section>
</template>

<style scoped>
section {
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container-narrow {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>
