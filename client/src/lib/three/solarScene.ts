import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface SolarSystemConfig {
  sunRadius: number
  planetRadius: number
  orbitRadius: number
  planetDistance: number
  rotationSpeed: number
  orbitSpeed: number
}

export class SolarSystemScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public controls!: OrbitControls
  public sun!: THREE.Mesh
  public planets: { [key: string]: THREE.Mesh } = {}
  public moons: { [key: string]: THREE.Mesh } = {}
  public orbits: { [key: string]: THREE.LineLoop } = {}
  public animationId: number | null = null
  private keyStates: { [key: string]: boolean } = {}
  private moveSpeed: number = 0.5
  private zoomSpeed: number = 0.1

  private config: SolarSystemConfig = {
    sunRadius: 2,
    planetRadius: 0.5,
    orbitRadius: 8,
    planetDistance: 12,
    rotationSpeed: 0.02,
    orbitSpeed: 0.01
  }

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    this.setupRenderer(container)
    this.setupControls()
    this.setupKeyboardControls()
    this.createScene()
    this.animate()
  }

  private setupRenderer(container: HTMLElement): void {
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x000011, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // Ensure the canvas is positioned correctly and has proper z-index
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.zIndex = '1'
    this.renderer.domElement.style.pointerEvents = 'auto'
    
    container.appendChild(this.renderer.domElement)
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = true
    this.controls.enablePan = true
    this.controls.autoRotate = false
    this.controls.autoRotateSpeed = 0.5
    this.controls.minDistance = 2
    this.controls.maxDistance = 100
    this.controls.maxPolarAngle = Math.PI * 0.8
  }

  private setupKeyboardControls(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.keyStates[event.code] = true
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      this.keyStates[event.code] = false
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
  }

  private createScene(): void {
    // Add lighting
    this.setupLighting()
    
    // Create starfield background
    this.createStarfield()
    
    // Create sun
    this.createSun()
    
    // Create planets
    this.createPlanets()
    
    // Create orbits
    this.createOrbits()
    
    // Set initial camera position
    this.camera.position.set(0, 5, 20)
    this.controls.target.set(0, 0, 0)
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1)
    this.scene.add(ambientLight)
    
    // Directional light from the sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 2)
    sunLight.position.set(0, 0, 0)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 4096
    sunLight.shadow.mapSize.height = 4096
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 100
    sunLight.shadow.camera.left = -50
    sunLight.shadow.camera.right = 50
    sunLight.shadow.camera.top = 50
    sunLight.shadow.camera.bottom = -50
    this.scene.add(sunLight)
    
    // Add point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100)
    pointLight.position.set(0, 0, 0)
    this.scene.add(pointLight)
    
    // Add hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.3)
    this.scene.add(hemisphereLight)
  }

  private createStarfield(): void {
    // Create high-resolution space background
    this.createHighResSpaceBackground()
    
    // Create enhanced starfield with different star types
    this.createEnhancedStarfield()
  }

  private createHighResSpaceBackground(): void {
    // Create a large sphere for the space background
    const spaceGeometry = new THREE.SphereGeometry(2000, 64, 64)
    const textureLoader = new THREE.TextureLoader()
    
    // Load high-resolution space texture
    const spaceTexture = textureLoader.load('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=4096&h=4096&fit=crop&crop=center')
    spaceTexture.wrapS = THREE.RepeatWrapping
    spaceTexture.wrapT = THREE.RepeatWrapping
    spaceTexture.repeat.set(1, 1)
    
    const spaceMaterial = new THREE.MeshBasicMaterial({
      map: spaceTexture,
      side: THREE.BackSide,
      transparent: false
    })
    
    const spaceSphere = new THREE.Mesh(spaceGeometry, spaceMaterial)
    spaceSphere.name = 'space-background'
    this.scene.add(spaceSphere)
  }


  private createEnhancedStarfield(): void {
    const starGeometry = new THREE.BufferGeometry()
    const starCount = 5000
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    
    for (let i = 0; i < starCount; i++) {
      // Random position on sphere - much further away
      const radius = 1500 + Math.random() * 1000
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Realistic star colors and sizes
      const starType = Math.random()
      if (starType < 0.6) {
        // White/yellow stars (like our sun)
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3
        sizes[i] = Math.random() * 1.5 + 0.5
      } else if (starType < 0.8) {
        // Blue stars (hot, massive)
        colors[i * 3] = 0.6 + Math.random() * 0.4
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3
        colors[i * 3 + 2] = 1
        sizes[i] = Math.random() * 2 + 1
      } else if (starType < 0.95) {
        // Red stars (cool, old)
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.3
        sizes[i] = Math.random() * 3 + 1
      } else {
        // Binary stars (white-blue)
        colors[i * 3] = 0.8 + Math.random() * 0.2
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2
        colors[i * 3 + 2] = 1
        sizes[i] = Math.random() * 2.5 + 1.5
      }
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const starMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 1,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    })
    
    const stars = new THREE.Points(starGeometry, starMaterial)
    stars.name = 'starfield'
    this.scene.add(stars)
  }


  private createSun(): void {
    const sunGeometry = new THREE.SphereGeometry(this.config.sunRadius, 128, 128)
    
    // Create realistic sun material with shader effects
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00
    })
    
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial)
    this.sun.castShadow = true
    this.sun.receiveShadow = true
    this.scene.add(this.sun)
    
    // Add realistic corona effect
    const coronaGeometry = new THREE.SphereGeometry(this.config.sunRadius * 1.3, 64, 64)
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    })
    
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial)
    corona.name = 'sun-corona'
    this.scene.add(corona)
    
    // Add multiple glow layers for realistic sun effect
    for (let i = 0; i < 8; i++) {
      const glowGeometry = new THREE.SphereGeometry(this.config.sunRadius * (1.5 + i * 0.3), 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.08 - i * 0.008
      })
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.name = `sun-glow-${i}`
      this.scene.add(glow)
    }
  }

  private createPlanets(): void {
    const planetData = [
      { 
        name: 'mercury', 
        color: 0x8c7853, 
        emissive: 0x221100,
        distance: 4, 
        size: 0.3,
        rotationSpeed: 0.05, // Mercury: 58.6 Earth days
        orbitSpeed: 0.04, // Mercury: 88 Earth days
        hasTexture: true
      },
      { 
        name: 'venus', 
        color: 0xffc649, 
        emissive: 0x331100,
        distance: 6, 
        size: 0.5,
        rotationSpeed: -0.02, // Venus: retrograde rotation, 243 Earth days
        orbitSpeed: 0.015, // Venus: 225 Earth days
        hasTexture: true
      },
      { 
        name: 'earth', 
        color: 0x4488ff, 
        emissive: 0x002244,
        distance: 8, 
        size: 0.6,
        rotationSpeed: 0.01, // Earth: 1 day
        orbitSpeed: 0.01, // Earth: 365 days
        hasTexture: true
      },
      { 
        name: 'mars', 
        color: 0xff4444, 
        emissive: 0x220000,
        distance: 12, 
        size: 0.5,
        rotationSpeed: 0.009, // Mars: 1.03 Earth days
        orbitSpeed: 0.008, // Mars: 687 Earth days
        hasTexture: true
      },
      { 
        name: 'jupiter', 
        color: 0xd8ca9d, 
        emissive: 0x332200,
        distance: 20, 
        size: 1.2,
        rotationSpeed: 0.025, // Jupiter: 0.41 Earth days
        orbitSpeed: 0.004, // Jupiter: 12 Earth years
        hasTexture: true
      },
      { 
        name: 'saturn', 
        color: 0xfad5a5, 
        emissive: 0x332200,
        distance: 30, 
        size: 1.0,
        rotationSpeed: 0.022, // Saturn: 0.45 Earth days
        orbitSpeed: 0.003, // Saturn: 29 Earth years
        hasTexture: true
      }
    ]
    
    planetData.forEach((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 64, 64)
      
      // Create material with texture if available
      let material: THREE.MeshPhongMaterial
      
      if (planet.hasTexture) {
        // Load real planet textures from the internet
        const textureLoader = new THREE.TextureLoader()
        let textureUrl = ''
        
        switch (planet.name) {
          case 'earth':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
            break
          case 'mars':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg'
            break
          case 'jupiter':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter_1k_color.jpg'
            break
          case 'saturn':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn_1k_color.jpg'
            break
          case 'mercury':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury_1k_color.jpg'
            break
          case 'venus':
            textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus_1k_color.jpg'
            break
        }
        
        if (textureUrl) {
          const texture = textureLoader.load(textureUrl)
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          
          // Create realistic planet material with enhanced shader effects
          material = new THREE.MeshPhongMaterial({ 
            map: texture,
            emissive: planet.emissive,
            shininess: 30,
            specular: 0x222222,
            bumpScale: 0.1,
            transparent: false
          })
        } else {
          material = new THREE.MeshPhongMaterial({ 
            color: planet.color,
            emissive: planet.emissive,
            shininess: 30,
            specular: 0x222222,
            transparent: false
          })
        }
      } else {
        material = new THREE.MeshPhongMaterial({ 
          color: planet.color,
          emissive: planet.emissive,
          shininess: 30,
          specular: 0x222222,
          transparent: false
        })
      }
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = planet.distance
      mesh.castShadow = true
      mesh.receiveShadow = true
      
      // Add atmospheric glow for planets with atmospheres
      if (planet.name === 'earth' || planet.name === 'venus') {
        this.createAtmosphericGlow(mesh, planet.name)
      }
      
      // Add user data for identification and animation
      mesh.userData = { 
        name: planet.name, 
        distance: planet.distance,
        rotationSpeed: planet.rotationSpeed,
        orbitSpeed: planet.orbitSpeed
      }
      
      this.planets[planet.name] = mesh
      this.scene.add(mesh)
      
      // Add rings for Saturn
      if (planet.name === 'saturn') {
        this.createSaturnRings(mesh)
      }
    })
    
    // Create Moon orbiting Earth
    this.createMoon()
  }

  private createAtmosphericGlow(planet: THREE.Mesh, planetName: string): void {
    const planetRadius = (planet.geometry as THREE.SphereGeometry).parameters.radius
    const glowGeometry = new THREE.SphereGeometry(planetRadius * 1.05, 64, 64)
    let glowColor = 0x87CEEB // Default blue
    
    if (planetName === 'earth') {
      glowColor = 0x87CEEB // Earth's blue atmosphere
    } else if (planetName === 'venus') {
      glowColor = 0xFFA500 // Venus's orange atmosphere
    }
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    })
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.name = `${planetName}-atmosphere`
    planet.add(glow)
  }

  private createMoon(): void {
    const moonGeometry = new THREE.SphereGeometry(0.2, 32, 32)
    const textureLoader = new THREE.TextureLoader()
    
    // Load real Moon texture
    const moonTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg')
    
    const moonMaterial = new THREE.MeshPhongMaterial({ 
      map: moonTexture,
      emissive: 0x111111,
      shininess: 5
    })
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial)
    moon.castShadow = true
    moon.receiveShadow = true
    
    moon.userData = {
      name: 'moon',
      parentPlanet: 'earth',
      orbitRadius: 1.5,
      rotationSpeed: 0.005,
      orbitSpeed: 0.05
    }
    
    this.moons['moon'] = moon
    this.scene.add(moon)
  }

  private createSaturnRings(planet: THREE.Mesh): void {
    const ringGeometry = new THREE.RingGeometry(1.3, 2.0, 32)
    const textureLoader = new THREE.TextureLoader()
    
    // Load real Saturn ring texture
    const ringTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn_ring_alpha.png')
    
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      alphaMap: ringTexture
    })
    
    const rings = new THREE.Mesh(ringGeometry, ringMaterial)
    rings.rotation.x = Math.PI / 2
    rings.name = 'saturn-rings'
    
    // Add rings to the planet so they move with it
    planet.add(rings)
  }

  private createOrbits(): void {
    const orbitData = [
      { name: 'mercury', radius: 4 },
      { name: 'venus', radius: 6 },
      { name: 'earth', radius: 8 },
      { name: 'mars', radius: 12 },
      { name: 'jupiter', radius: 20 },
      { name: 'saturn', radius: 30 }
    ]
    
    orbitData.forEach(orbit => {
      const points = []
      const segments = 64
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(
          Math.cos(angle) * orbit.radius,
          0,
          Math.sin(angle) * orbit.radius
        ))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2
      })
      
      const orbitLine = new THREE.LineLoop(geometry, material)
      this.orbits[orbit.name] = orbitLine
      this.scene.add(orbitLine)
    })
  }

  public animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate())
    
    const time = Date.now() * 0.001 // Convert to seconds
    
    // Handle keyboard controls
    this.handleKeyboardMovement()
    
    // Rotate sun with pulsing effect
    this.sun.rotation.y += this.config.rotationSpeed
    this.sun.rotation.x += this.config.rotationSpeed * 0.3
    this.sun.scale.setScalar(1 + Math.sin(time * 2) * 0.05) // Subtle pulsing
    
    // Animate sun glow layers
    for (let i = 0; i < 8; i++) {
      const glow = this.scene.getObjectByName(`sun-glow-${i}`)
      if (glow) {
        glow.rotation.y += this.config.rotationSpeed * (0.5 + i * 0.1)
        glow.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.02)
      }
    }
    
    // Animate sun corona
    const corona = this.scene.getObjectByName('sun-corona')
    if (corona) {
      corona.rotation.y += this.config.rotationSpeed * 0.8
      corona.scale.setScalar(1 + Math.sin(time * 1.5) * 0.03)
    }
    
    // Animate planets with individual rotation and orbit speeds
    Object.entries(this.planets).forEach(([, planet]) => {
      const userData = planet.userData
      
      // Rotate planet on its axis
      planet.rotation.y += userData.rotationSpeed
      planet.rotation.x += userData.rotationSpeed * 0.1
      
      // Orbit around sun with different speeds
      const orbitTime = time * userData.orbitSpeed
      planet.position.x = Math.cos(orbitTime) * userData.distance
      planet.position.z = Math.sin(orbitTime) * userData.distance
      planet.position.y = Math.sin(orbitTime * 0.5) * 0.2 // Slight vertical movement
      
      // Animate Saturn's rings (they should rotate with the planet, not independently)
      if (planet.name === 'saturn') {
        const rings = planet.getObjectByName('saturn-rings')
        if (rings) {
          rings.rotation.z += userData.rotationSpeed * 0.5 // Rings rotate slower than planet
        }
      }
    })
    
    // Animate moons
    Object.entries(this.moons).forEach(([, moon]) => {
      const userData = moon.userData
      const parentPlanet = this.planets[userData.parentPlanet]
      
      if (parentPlanet) {
        // Rotate moon on its axis
        moon.rotation.y += userData.rotationSpeed
        
        // Orbit around parent planet
        const moonOrbitTime = time * userData.orbitSpeed
        moon.position.x = parentPlanet.position.x + Math.cos(moonOrbitTime) * userData.orbitRadius
        moon.position.z = parentPlanet.position.z + Math.sin(moonOrbitTime) * userData.orbitRadius
        moon.position.y = parentPlanet.position.y + Math.sin(moonOrbitTime * 0.3) * 0.1
      }
    })
    
    // Rotate starfield slowly
    const starfield = this.scene.getObjectByName('starfield')
    if (starfield) {
      starfield.rotation.y += 0.0005
    }
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private handleKeyboardMovement(): void {
    const direction = new THREE.Vector3()
    const right = new THREE.Vector3()
    
    // Get camera direction vectors
    this.camera.getWorldDirection(direction)
    right.crossVectors(direction, this.camera.up).normalize()
    
    // Handle WASD movement
    if (this.keyStates['KeyW']) {
      this.camera.position.add(direction.multiplyScalar(this.moveSpeed))
    }
    if (this.keyStates['KeyS']) {
      this.camera.position.add(direction.multiplyScalar(-this.moveSpeed))
    }
    if (this.keyStates['KeyA']) {
      this.camera.position.add(right.multiplyScalar(-this.moveSpeed))
    }
    if (this.keyStates['KeyD']) {
      this.camera.position.add(right.multiplyScalar(this.moveSpeed))
    }
    if (this.keyStates['KeyQ']) {
      this.camera.position.y += this.moveSpeed
    }
    if (this.keyStates['KeyE']) {
      this.camera.position.y -= this.moveSpeed
    }
    
    // Handle zoom with mouse wheel (already handled by OrbitControls)
    if (this.keyStates['Equal'] || this.keyStates['NumpadAdd']) {
      this.camera.position.add(direction.multiplyScalar(this.zoomSpeed))
    }
    if (this.keyStates['Minus'] || this.keyStates['NumpadSubtract']) {
      this.camera.position.add(direction.multiplyScalar(-this.zoomSpeed))
    }
  }

  public focusOnPlanet(planetName: string): void {
    const planet = this.planets[planetName]
    if (!planet) return
    
    // Smooth camera transition to planet
    const targetPosition = new THREE.Vector3(
      planet.position.x + 5,
      planet.position.y + 2,
      planet.position.z + 5
    )
    
    this.animateCameraTo(targetPosition, planet.position)
  }

  private animateCameraTo(targetPosition: THREE.Vector3, lookAt: THREE.Vector3): void {
    const startPosition = this.camera.position.clone()
    const startLookAt = this.controls.target.clone()
    const duration = 2000 // 2 seconds
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const easedProgress = easeInOutCubic(progress)
      
      // Interpolate position
      this.camera.position.lerpVectors(startPosition, targetPosition, easedProgress)
      this.controls.target.lerpVectors(startLookAt, lookAt, easedProgress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    
    this.renderer.dispose()
    this.controls.dispose()
    
    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  public getPlanetAtPosition(x: number, y: number): string | null {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    mouse.x = (x / this.renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(y / this.renderer.domElement.clientHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, this.camera)
    
    // Check planets first
    const planetIntersects = raycaster.intersectObjects(Object.values(this.planets))
    if (planetIntersects.length > 0) {
      return planetIntersects[0].object.userData.name
    }
    
    // Check moons
    const moonIntersects = raycaster.intersectObjects(Object.values(this.moons))
    if (moonIntersects.length > 0) {
      return moonIntersects[0].object.userData.name
    }
    
    return null
  }
}
