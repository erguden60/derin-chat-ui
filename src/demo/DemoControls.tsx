import { useState, useEffect } from 'preact/hooks';
import DerinChat from '../index';

function ColorPickerRow({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input 
                    type="color" 
                    value={ value || '#000000'} 
                    onInput={(e) => onChange(e.currentTarget.value)}
                    style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none', borderRadius: '4px' }}
                />
                <button 
                  onClick={() => onChange('')} 
                  disabled={!value}
                  style={{ 
                    fontSize: '10px', padding: '4px 8px', border: '1px solid #ddd', 
                    borderRadius: '4px', background: value ? '#fff' : '#f5f5f5', 
                    cursor: value ? 'pointer' : 'default', color: value ? '#333' : '#aaa' 
                  }}
                  title="Clear to fallback to theme default"
                >
                  Clear
                </button>
            </div>
        </div>
    )
}

export function DemoControls() {
    const [config, setConfig] = useState({
        title: 'Derin Chat',
        subtitle: 'Online Support',
        primaryColor: '#000000', // Default black
        bgColor: '', 
        headerBg: '',
        userMessageBg: '',
        botMessageBg: '',
        inputBg: '',
        position: 'bottom-right',
        language: 'en',
        theme: 'light',
        layout: 'normal',
        stream: true // Enable streaming by default for demo
    });

    // Re-initialize widget when config changes
    useEffect(() => {
        DerinChat.init({
            mock: true,
            features: {
                fileUpload: true,
                quickReplies: true,
                agentMode: true,
                timestamps: true,
                messageTools: true,
                voice: {
                    input: true,
                    output: true,
                    language: config.language === 'tr' ? 'tr-TR' : 'en-US'
                }
            },
            ui: {
                position: config.position as any,
                theme: config.theme as any,
                layout: config.layout as any,
                texts: {
                    title: config.title,
                    subtitle: config.subtitle,
                    placeholder: config.language === 'tr' ? 'Mesaj yazın...' : 'Type your message...',
                    openChat: config.language === 'tr' ? 'Sohbeti aç' : 'Open chat',
                    closeChat: config.language === 'tr' ? 'Sohbeti kapat' : 'Close chat'
                },
                colors: {
                    primary: config.primaryColor || undefined,
                    background: config.bgColor || undefined,
                    headerBg: config.headerBg || undefined,
                    userMessageBg: config.userMessageBg || undefined,
                    botMessageBg: config.botMessageBg || undefined,
                    inputBg: config.inputBg || undefined,
                }
            },
            connection: {
                stream: config.stream
            },
            behavior: {
                openOnLoad: true, // Keep open for easier configuration
                persistSession: false, // Disable persistence for demo to see changes instantly
                closeOnOutsideClick: false // Prevent closing when interacting with controls
            },
            onMessageCopy: (id, text) => {
                console.log('📝 Copied message:', id, text.substring(0, 30) + '...');
            },
            onChatClear: () => {
                console.log('🧹 Chat history cleared');
            },
            onFeedback: (id, type) => {
                console.log(`👍 Feedback given [${type}] for:`, id);
            }
        });
    }, [config]);

    return (
        <div style={{ padding: '24px', fontFamily: 'var(--font-mono)', color: '#333' }}>
            <div className="window-header" style={{ marginBottom: '20px', background: 'transparent', padding: 0, border: 'none' }}>
                <div className="window-dots">
                    <div className="dot dot-red"></div>
                    <div className="dot dot-yellow"></div>
                    <div className="dot dot-green"></div>
                </div>
                <span className="window-title" style={{ marginLeft: '12px', fontWeight: 600 }}>Widget Configurator</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title Input */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Widget Title
                    </label>
                    <input
                        type="text"
                        value={config.title}
                        onInput={(e) => setConfig({ ...config, title: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                </div>

                {/* Subtitle Input */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Subtitle
                    </label>
                    <input
                        type="text"
                        value={config.subtitle}
                        onInput={(e) => setConfig({ ...config, subtitle: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                </div>

                {/* Advanced Color Pickers */}
                <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '12px', background: '#fafafa' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '12px' }}>
                        Custom Colors
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 400, marginTop: '2px' }}>
                            Leave empty (Clear) to use theme defaults (auto Dark/Light).
                        </div>
                    </div>
                    
                    <ColorPickerRow label="Primary Accent" value={config.primaryColor} onChange={(v) => setConfig({ ...config, primaryColor: v })} />
                    <ColorPickerRow label="Chat Background" value={config.bgColor} onChange={(v) => setConfig({ ...config, bgColor: v })} />
                    <ColorPickerRow label="Header Background" value={config.headerBg} onChange={(v) => setConfig({ ...config, headerBg: v })} />
                    <ColorPickerRow label="User Message Bubble" value={config.userMessageBg} onChange={(v) => setConfig({ ...config, userMessageBg: v })} />
                    <ColorPickerRow label="Bot Message Bubble" value={config.botMessageBg} onChange={(v) => setConfig({ ...config, botMessageBg: v })} />
                    <ColorPickerRow label="Input Box Background" value={config.inputBg} onChange={(v) => setConfig({ ...config, inputBg: v })} />
                </div>

                {/* Position Select */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Position
                    </label>
                    <select
                        value={config.position}
                        onChange={(e) => setConfig({ ...config, position: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                    </select>
                </div>

                {/* Language Select */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Language
                    </label>
                    <select
                        value={config.language}
                        onChange={(e) => setConfig({ ...config, language: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    >
                        <option value="en">English (Default)</option>
                        <option value="tr">Turkish</option>
                    </select>
                </div>

                {/* Theme Select */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Theme
                    </label>
                    <select
                        value={config.theme}
                        onChange={(e) => setConfig({ ...config, theme: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System Default)</option>
                    </select>
                </div>

                {/* Layout Select */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: '#666' }}>
                        Layout
                    </label>
                    <select
                        value={config.layout}
                        onChange={(e) => setConfig({ ...config, layout: e.currentTarget.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    >
                        <option value="normal">Normal</option>
                        <option value="compact">Compact</option>
                        <option value="full-screen">Full Screen</option>
                    </select>
                </div>

                {/* Stream AI Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input 
                       type="checkbox" 
                       id="stream-toggle"
                       checked={config.stream}
                       onChange={(e) => setConfig({ ...config, stream: e.currentTarget.checked })}
                       style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="stream-toggle" style={{ fontSize: '12px', fontWeight: 500, color: '#333', cursor: 'pointer' }}>
                        Enable AI Streaming (Typewriter effect)
                    </label>
                </div>

                <div style={{ marginTop: '10px', padding: '12px', background: '#f5f5f5', borderRadius: '6px', fontSize: '11px', color: '#666' }}>
                    💡 Changes apply instantly. Click the widget button to see updates.
                </div>
            </div>
        </div>
    );
}
