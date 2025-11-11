// Points generation module
export function spawnPoints(n, scene) {
  const pts = [];
  const centers = [[-30, -30], [30, -30], [-30, 30], [30, 30], [0, 0]];

  for (let i = 0; i < n; i++) {
    const cluster = Math.floor(Math.random() * 5);
    const cx = centers[cluster];
    const x = cx[0] + (Math.random() - 0.5) * 20;
    const z = cx[1] + (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 40;

    const g = new THREE.SphereGeometry(1, 6, 6);
    const m = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });

    const p = {
      m: new THREE.Mesh(g, m),
      x, y, z,
      cluster: -1,
      visited: 0
    };

    p.m.position.set(x, y, z);
    scene.add(p.m);
    pts.push(p);
  }

  return pts;
}
