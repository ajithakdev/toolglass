import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft, Copy, Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  toolTitle?: string;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Local debugging in dev console only — STRICTLY NO remote telemetry
    if (process.env.NODE_ENV === 'development') {
      console.error('[Toolglass ErrorBoundary Caught Error]:', error, errorInfo);
    }
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
  };

  handleCopyDebugInfo = async () => {
    const { error, errorInfo } = this.state;
    const { toolTitle } = this.props;

    const debugReport = [
      `### Toolglass Error Report`,
      `- **Tool**: ${toolTitle || 'Application Shell'}`,
      `- **Timestamp**: ${new Date().toISOString()}`,
      `- **Error Message**: ${error?.message || 'Unknown error'}`,
      `- **Error Name**: ${error?.name || 'Error'}`,
      ``,
      `#### Component Stack`,
      '```text',
      errorInfo?.componentStack?.trim() || 'No component stack available',
      '```',
      ``,
      `*Note: Generated locally in Toolglass. 100% private, no remote tracking.*`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(debugReport);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Clipboard write fallback
    }
  };

  render() {
    const { hasError, error, errorInfo, copied, showDetails } = this.state;
    const { children, toolTitle, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback && error) {
      return fallback(error, this.resetError);
    }

    return (
      <div
        data-testid="error-boundary-card"
        style={{
          width: '100%',
          maxWidth: 720,
          margin: '40px auto',
          padding: '36px 32px',
          borderRadius: 'var(--radius)',
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle glowing ambient backdrop */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(244, 114, 182, 0.1) 60%, transparent 80%)',
            pointerEvents: 'none',
            filter: 'blur(30px)',
          }}
        />

        {/* Error icon badge */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 114, 182, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 20,
            color: '#ef4444',
            boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertTriangle size={30} strokeWidth={1.8} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            marginBottom: 8,
          }}
        >
          {toolTitle ? `${toolTitle} encountered an error` : 'Something went wrong'}
        </h2>

        {/* Subtitle / friendly message */}
        <p
          style={{
            fontSize: 14,
            color: 'var(--ink-soft)',
            maxWidth: 500,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          An unexpected issue occurred while rendering this tool. The rest of Toolglass remains fully functional.
        </p>

        {/* Error message pill */}
        {error && (
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.07)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              textAlign: 'left',
              wordBreak: 'break-word',
              marginBottom: 24,
            }}
          >
            <span style={{ color: '#ef4444', fontWeight: 600, marginRight: 8 }}>Error:</span>
            {error.message || 'Unknown runtime exception'}
          </div>
        )}

        {/* Privacy assurance callout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--ink-mute)',
            background: 'var(--surface-nav-item)',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            marginBottom: 24,
          }}
        >
          <ShieldCheck size={14} color="var(--accent)" />
          <span>100% Client-Side Privacy: No error logs or data were sent over the network.</span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <button
            onClick={this.resetError}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = '0.92'; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <RotateCcw size={15} strokeWidth={2.2} />
            Try Again
          </button>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--surface-button-off)',
              color: 'var(--ink)',
              border: '1px solid var(--glass-border)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <ArrowLeft size={15} strokeWidth={2.2} />
            Return to Tools
          </Link>

          <button
            onClick={this.handleCopyDebugInfo}
            aria-label="Copy debug info"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--surface-button-off)',
              color: 'var(--ink-soft)',
              border: '1px solid var(--glass-border)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Debug Info'}
          </button>
        </div>

        {/* Technical stack toggle */}
        {errorInfo && (
          <div style={{ width: '100%', maxWidth: 580, textAlign: 'left', marginTop: 8 }}>
            <button
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-mute)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 0',
                margin: '0 auto',
              }}
            >
              <span>{showDetails ? 'Hide technical stack' : 'View technical stack (client-only)'}</span>
            </button>

            {showDetails && (
              <pre
                style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--kbd-bg)',
                  border: '1px solid var(--kbd-border)',
                  color: 'var(--ink-soft)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  maxHeight: 180,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {errorInfo.componentStack?.trim() || 'No component stack recorded'}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }
}
