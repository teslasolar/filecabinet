#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// State machine for file scanning
class FileScannerStateMachine {
    constructor(filename) {
        this.filename = filename;
        this.state = 'IDLE';
        this.errors = [];
        this.warnings = [];
        this.content = '';
        this.size = 0;
    }

    transition(newState) {
        const validTransitions = {
            'IDLE': ['LOADING'],
            'LOADING': ['ANALYZING', 'ERROR'],
            'ANALYZING': ['VALIDATING', 'ERROR'],
            'VALIDATING': ['COMPLETE', 'FAILED'],
            'ERROR': ['COMPLETE'],
            'FAILED': ['COMPLETE'],
            'COMPLETE': []
        };

        if (validTransitions[this.state].includes(newState)) {
            console.log(`  ${this.filename}: ${this.state} → ${newState}`);
            this.state = newState;
            return true;
        }
        console.error(`  Invalid transition: ${this.state} → ${newState}`);
        return false;
    }

    load() {
        this.transition('LOADING');
        try {
            this.content = fs.readFileSync(this.filename, 'utf8');
            this.size = (this.content.length / 1024).toFixed(2);
            return true;
        } catch (e) {
            this.errors.push(`Failed to load: ${e.message}`);
            this.transition('ERROR');
            return false;
        }
    }

    analyze() {
        if (this.state !== 'LOADING') return false;
        this.transition('ANALYZING');

        // Check DOCTYPE
        if (!this.content.includes('<!DOCTYPE html')) {
            this.warnings.push('Missing DOCTYPE declaration');
        }

        // Check Three.js dependency
        if (!this.content.includes('three.min.js') && !this.content.includes('three.js')) {
            this.errors.push('Missing Three.js dependency');
        }

        // Check for brace matching
        const braceOpen = (this.content.match(/{/g) || []).length;
        const braceClose = (this.content.match(/}/g) || []).length;
        if (braceOpen !== braceClose) {
            this.errors.push(`Brace mismatch: ${braceOpen} open, ${braceClose} close`);
        }

        // Check for parenthesis matching
        const parenOpen = (this.content.match(/\(/g) || []).length;
        const parenClose = (this.content.match(/\)/g) || []).length;
        if (parenOpen !== parenClose) {
            this.errors.push(`Parenthesis mismatch: ${parenOpen} open, ${parenClose} close`);
        }

        // Check for Scene initialization
        if (!this.content.includes('new THREE.Scene')) {
            this.errors.push('No THREE.Scene initialization found');
        }

        // Check for WebGLRenderer
        if (!this.content.includes('new THREE.WebGLRenderer')) {
            this.errors.push('No WebGLRenderer found');
        }

        // Check for animation loop
        if (!this.content.includes('requestAnimationFrame')) {
            this.warnings.push('No animation loop detected');
        }

        // Check for console.log
        if (this.content.includes('console.log')) {
            this.warnings.push('Contains console.log statements');
        }

        // Check for debugger
        if (this.content.includes('debugger')) {
            this.warnings.push('Contains debugger statement');
        }

        // Check file size
        if (parseFloat(this.size) > 10) {
            this.warnings.push(`Large file size: ${this.size}KB`);
        }

        // Check for unclosed tags
        const scriptOpen = (this.content.match(/<script/g) || []).length;
        const scriptClose = (this.content.match(/<\/script>/g) || []).length;
        if (scriptOpen !== scriptClose) {
            this.errors.push(`Script tag mismatch: ${scriptOpen} open, ${scriptClose} close`);
        }

        return true;
    }

    validate() {
        if (this.state !== 'ANALYZING') return false;
        this.transition('VALIDATING');

        if (this.errors.length > 0) {
            this.transition('FAILED');
            return false;
        }

        this.transition('COMPLETE');
        return true;
    }

    getReport() {
        return {
            filename: this.filename,
            state: this.state,
            errors: this.errors,
            warnings: this.warnings,
            size: this.size,
            isValid: this.errors.length === 0
        };
    }
}

// Main scanner
class ErrorScanner {
    constructor() {
        this.files = [
            'virtual-repository-3d.html',
            'neural-network-3d.html',
            'galaxy-explorer-3d.html',
            'particle-swarm-3d.html',
            'dna-helix-3d.html',
            'fractal-tree.html',
            'vortex.html',
            'quantum-field.html',
            'matrix-cube.html',
            'voxel-world.html',
            'procedural-city.html',
            'ecosystem.html',
            'neural-training.html',
            'model-evolution.html',
            'data-pipeline.html',
            'hyperparameter-search.html',
            'attention-mechanism.html',
            'reinforcement-learning.html',
            'gradient-descent.html',
            'feature-extraction.html',
            'clustering.html',
            'gan-training.html',
            'transfer-learning.html',
            'ensemble-methods.html'
        ];
        this.results = [];
    }

    scan() {
        console.log('\n🔍 STATE MACHINE ERROR SCANNER\n');
        console.log(`Scanning ${this.files.length} files...\n`);

        for (const file of this.files) {
            const fsm = new FileScannerStateMachine(file);

            if (!fsm.load()) {
                this.results.push(fsm.getReport());
                continue;
            }

            fsm.analyze();
            fsm.validate();

            this.results.push(fsm.getReport());
        }

        this.printReport();
    }

    printReport() {
        console.log('\n' + '='.repeat(80));
        console.log('SCAN RESULTS');
        console.log('='.repeat(80) + '\n');

        let validCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        for (const result of this.results) {
            const icon = result.isValid ? '✅' : '❌';
            console.log(`${icon} ${result.filename} (${result.size}KB)`);

            if (result.errors.length > 0) {
                errorCount++;
                console.log('  ERRORS:');
                result.errors.forEach(e => console.log(`    • ${e}`));
            }

            if (result.warnings.length > 0) {
                warningCount += result.warnings.length;
                console.log('  WARNINGS:');
                result.warnings.forEach(w => console.log(`    • ${w}`));
            }

            if (result.isValid && result.warnings.length === 0) {
                validCount++;
                console.log('  ✓ No issues found');
            }

            console.log('');
        }

        console.log('='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total Files:     ${this.files.length}`);
        console.log(`Valid:           ${validCount} ✅`);
        console.log(`With Errors:     ${errorCount} ❌`);
        console.log(`Total Warnings:  ${warningCount} ⚠️`);
        console.log('='.repeat(80) + '\n');

        if (errorCount === 0) {
            console.log('🎉 All files passed validation!\n');
            return 0;
        } else {
            console.log('⚠️  Some files have errors that need fixing.\n');
            return 1;
        }
    }
}

// Run scanner
const scanner = new ErrorScanner();
const exitCode = scanner.scan();
process.exit(exitCode);
