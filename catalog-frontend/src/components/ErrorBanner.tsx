type Props = { message: string }

export default function ErrorBanner({ message }: Props) {
  return (
    <div style={{ background: '#fee', color: '#900', padding: 12, border: '1px solid #f99', margin: 12 }}>
      {message}
    </div>
  )
}
