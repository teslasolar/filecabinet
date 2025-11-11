// Three.js scene and rendering
export function initScene(app) {
  app.scene = new THREE.Scene();
  app.scene.background = new THREE.Color(0x000a14);
  app.scene.fog = new THREE.Fog(0x000a14, 100, 500);

  app.camera = new THREE.PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    1,
    1000
  );
  app.camera.position.set(80, 80, 80);
  app.camera.lookAt(0, 0, 0);

  const canvas = document.getElementById('c');
  app.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  app.renderer.setSize(innerWidth, innerHeight);

  app.scene.add(new THREE.AmbientLight(0x404040));

  const light = new THREE.PointLight(0x00ffff, 1, 400);
  light.position.set(0, 100, 0);
  app.scene.add(light);
}

export function updateViz(app) {
  app.centroids.forEach(c => {
    c.m.rotation.x += 0.02;
    c.m.rotation.y += 0.02;
    const pulse = Math.sin(Date.now() * 0.003);
    c.m.scale.set(
      1 + pulse * 0.2,
      1 + pulse * 0.2,
      1 + pulse * 0.2
    );
  });

  app.pts.forEach(p => {
    p.m.rotation.x += 0.01;
    p.m.rotation.y += 0.01;
  });
}

export function render(app) {
  const t = Date.now() * 0.0002;
  app.camera.position.x = Math.sin(t) * 120;
  app.camera.position.z = Math.cos(t) * 120;
  app.camera.lookAt(0, 0, 0);

  app.renderer.render(app.scene, app.camera);
}
