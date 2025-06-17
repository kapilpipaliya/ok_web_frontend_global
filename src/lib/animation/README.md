# GSAP Animation in Dynamic Components

GSAP (GreenSock Animation Platform) is now available in all dynamic components through the `args` object.

## Basic Usage

In your component's `props` or `fns` functions, you can access GSAP like this:

```javascript
// Simple animation
args.gsap.to(args.ref(), {
  duration: 1,
  x: 100,
  rotation: 360,
  ease: "power2.inOut"
});

// Using timeline
const tl = args.createTimeline();
tl.to(args.ref(), { duration: 0.5, opacity: 0 })
  .to(args.ref(), { duration: 0.5, scale: 1.2 })
  .to(args.ref(), { duration: 0.5, opacity: 1 });
```

## Available Methods

### Core GSAP
- `args.gsap` - The main GSAP object
- `args.createTimeline(options)` - Create a new timeline
- `args.createTween(targets, vars)` - Create a "to" tween
- `args.createFromTween(targets, vars)` - Create a "from" tween
- `args.createFromToTween(targets, fromVars, toVars)` - Create a "fromTo" tween

### Utilities
- `args.killTweensOf(targets)` - Kill all tweens of a target
- `args.getTweensOf(targets)` - Get all active tweens of a target
- `args.isTweening(targets)` - Check if a target is currently tweening
- `args.setGSAPDefaults(vars)` - Set default tween properties

### Easing Presets
Access common easing functions via `args.gsapEasings`:
- `power1`, `power2`, `power3`, `power4`
- `back`, `elastic`, `bounce`, `rough`
- `circ`, `expo`, `sine`
- `linear` (same as `none`)

Combine with direction modifiers:
- `args.gsapEasings.power2 + args.gsapEasings.easeOut` = "power2.out"
- `args.gsapEasings.elastic + args.gsapEasings.easeInOut` = "elastic.inOut"

## Example Component with Animation

```hjson
{
  vertexes: [
    {
      id: "animated-box",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        props: '''
return {
  as: "div",
  text: "Hover me!",
  onMouseEnter: () => {
    args.gsap.to(args.ref(), {
      duration: 0.3,
      scale: 1.1,
      backgroundColor: args.theme.var.color.primary,
      ease: args.gsapEasings.power2 + args.gsapEasings.easeOut
    });
  },
  onMouseLeave: () => {
    args.gsap.to(args.ref(), {
      duration: 0.3,
      scale: 1,
      backgroundColor: args.theme.var.color.background,
      ease: args.gsapEasings.power2 + args.gsapEasings.easeIn
    });
  },
  onMount: () => {
    // Entrance animation
    args.gsap.from(args.ref(), {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: args.gsapEasings.elastic + args.gsapEasings.easeOut
    });
  }
};
''',
        css: '''
return `._id {
  padding: 2rem;
  background: ${args.theme.var.color.background};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
}`;
'''
      }
    }
  ],
  edges: []
}
```

## Advanced Plugins

GSAP plugins are available via `args.GSAPPlugins` but need to be registered before use:

```javascript
// In your component's onMount or fns
args.registerGSAPPlugins(args.GSAPPlugins.ScrollTrigger);

// Then use the plugin
args.gsap.to(args.ref(), {
  scrollTrigger: {
    trigger: args.ref(),
    start: "top 80%",
    end: "bottom 20%",
    scrub: true
  },
  x: 100,
  opacity: 1
});
```

## Best Practices

1. **Clean up animations** when components unmount:
   ```javascript
   onCleanup: () => {
     args.killTweensOf(args.ref());
   }
   ```

2. **Use refs** for targeting elements:
   ```javascript
   args.gsap.to(args.ref(), { ... });
   ```

3. **Combine with theme** for consistent animations:
   ```javascript
   args.gsap.to(args.ref(), {
     backgroundColor: args.theme.var.color.primary,
     color: args.theme.var.color.primary_text
   });
   ```

4. **Store timelines** for complex sequences:
   ```javascript
   fns: '''
   function createAnimation() {
     const tl = args.createTimeline({ paused: true });
     tl.to(args.ref(), { ... });
     return tl;
   }
   '''
   ```

Note: Some premium GSAP plugins (MorphSVG, DrawSVG, SplitText, etc.) require a GreenSock Club membership and may not work without proper licensing.