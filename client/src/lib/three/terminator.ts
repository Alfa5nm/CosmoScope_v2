import * as THREE from 'three'

export class TerminatorShader {
  public static createDayNightMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        dayColor: { value: new THREE.Color(0x4488ff) },
        nightColor: { value: new THREE.Color(0x001122) },
        terminatorWidth: { value: 0.1 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunDirection;
        uniform vec3 dayColor;
        uniform vec3 nightColor;
        uniform float terminatorWidth;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          // Calculate sun direction based on time
          vec3 sunDir = normalize(sunDirection);
          
          // Calculate dot product between normal and sun direction
          float dotProduct = dot(normalize(vNormal), sunDir);
          
          // Create smooth transition between day and night
          float terminator = smoothstep(-terminatorWidth, terminatorWidth, dotProduct);
          
          // Mix day and night colors
          vec3 color = mix(nightColor, dayColor, terminator);
          
          // Add some atmospheric glow
          float glow = pow(1.0 - abs(dotProduct), 2.0) * 0.3;
          color += vec3(0.1, 0.3, 0.8) * glow;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
  }

  public static createAtmosphereMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        atmosphereColor: { value: new THREE.Color(0x0088ff) },
        intensity: { value: 0.5 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;
        uniform float intensity;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Calculate rim lighting
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float rim = 1.0 - max(0.0, dot(vNormal, viewDirection));
          
          // Calculate sun direction effect
          float sunEffect = max(0.0, dot(normalize(vNormal), normalize(sunDirection)));
          
          // Combine rim and sun effects
          float finalIntensity = rim * sunEffect * intensity;
          
          gl_FragColor = vec4(atmosphereColor, finalIntensity);
        }
      `,
      transparent: true,
      side: THREE.BackSide
    })
  }

  public static calculateSunDirection(date: Date, _latitude: number = 0, longitude: number = 0): THREE.Vector3 {
    // Simplified sun direction calculation
    // In a real implementation, you'd use proper astronomical calculations
    
    const year = date.getFullYear()
    const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    
    // Approximate sun declination
    const declination = 23.45 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365)
    
    // Hour angle (simplified)
    const hourAngle = (date.getUTCHours() + date.getUTCMinutes() / 60) * 15 - longitude
    
    // Convert to Cartesian coordinates
    const decRad = declination * Math.PI / 180
    const hourRad = hourAngle * Math.PI / 180
    
    const x = Math.cos(decRad) * Math.cos(hourRad)
    const y = Math.sin(decRad)
    const z = Math.cos(decRad) * Math.sin(hourRad)
    
    return new THREE.Vector3(x, y, z).normalize()
  }

  public static updateDayNightMaterial(material: THREE.ShaderMaterial, date: Date, planet: string = 'earth'): void {
    if (!material.uniforms) return
    
    const sunDirection = this.calculateSunDirection(date)
    material.uniforms.sunDirection.value.copy(sunDirection)
    material.uniforms.time.value = date.getTime() / 1000
    
    // Update colors based on planet
    switch (planet) {
      case 'earth':
        material.uniforms.dayColor.value.setHex(0x4488ff)
        material.uniforms.nightColor.value.setHex(0x001122)
        break
      case 'moon':
        material.uniforms.dayColor.value.setHex(0xcccccc)
        material.uniforms.nightColor.value.setHex(0x333333)
        break
      case 'mars':
        material.uniforms.dayColor.value.setHex(0xff4444)
        material.uniforms.nightColor.value.setHex(0x441111)
        break
    }
  }

  public static createTerminatorLine(radius: number, sunDirection: THREE.Vector3): THREE.Line {
    const points: THREE.Vector3[] = []
    const segments = 64
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      // Calculate y position based on terminator
      const y = -sunDirection.y * radius / Math.sqrt(sunDirection.x * sunDirection.x + sunDirection.z * sunDirection.z)
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5
    })
    
    return new THREE.Line(geometry, material)
  }
}
