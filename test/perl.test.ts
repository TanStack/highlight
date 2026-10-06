import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { perl } from '../src/languages/perl'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [perl] })
const classes = (code: string, text: string) => tokenClasses(highlighter, code, text, 'perl')

describe('Perl documentation syntax', () => {
  it('highlights a realistic module and script', () => {
    const code = `#!/usr/bin/perl
use strict;
use warnings;
use 5.010;
use List::Util qw(sum max);

package My::Counter;

=head1 NAME

My::Counter - count "things" # not code

=cut

sub new {
    my ($class, %args) = @_;
    my $self = { count => $args{start} // 0, name => 'it' };
    return bless $self, $class;
}

sub increment($self, $by = 1) {
    $self->{count} += $by;
    return $self->{count};
}

package main;

my $counter = My::Counter->new(start => 0x1F);
my @words = qw(alpha beta#gamma delta);
my $total = 0;
for my $i (1..10) { $total += $i ** 2 }
my $avg = $total / scalar(@words) / 2;
my $text = "Total: $total, items: @{[ scalar @words ]} \\" done";
(my $copy = $text) =~ s/Total/Sum/g;
my @parts = split /,\\s*/, $line;
print STDERR "last index: $#words, pid $$\\n" unless $ENV{QUIET};
print <<~EOT;
    Hello $name, "quoted" # not a comment
    EOT
open(my $fh, '<', $file) or die "Can't open $file: $!";
while (my $line = <$fh>) { $counter->increment; }
__END__
Data with "quotes" and s/x/y/
`
    expect(classes(code, '#!/usr/bin/perl')).toEqual(['meta'])
    expect(classes(code, 'List::Util')).toEqual(['type'])
    expect(classes(code, 'qw(sum max)')).toEqual(['string'])
    expect(classes(code, '5.010')).toEqual(['number'])
    expect(classes(code, '=head1 NAME\n\nMy::Counter - count "things" # not code\n\n=cut')).toEqual(['comment'])
    expect(classes(code, 'new')).toEqual(['function'])
    expect(classes(code, '%args')).toEqual(['variable'])
    expect(classes(code, '@_')).toEqual(['variable'])
    expect(classes(code, 'count =>')).toEqual(['property', undefined, 'operator'])
    expect(classes(code, 'start} //')).toEqual(['property', undefined, 'operator'])
    expect(classes(code, 'bless')).toEqual(['function'])
    expect(classes(code, 'increment(')).toEqual(['function', undefined])
    expect(classes(code, 'My::Counter->new')).toEqual(['type', 'operator', 'function'])
    expect(classes(code, '0x1F')).toEqual(['number'])
    expect(classes(code, 'qw(alpha beta#gamma delta)')).toEqual(['string'])
    expect(classes(code, '1..10')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, '$total / scalar')).toEqual(['variable', undefined, 'operator', undefined, 'function'])
    expect(classes(code, '"Total: $total, items: @{[ scalar @words ]} \\" done"')).toEqual(['string'])
    expect(classes(code, 's/Total/Sum/g')).toEqual(['string'])
    expect(classes(code, '/,\\s*/')).toEqual(['string'])
    expect(classes(code, '"last index: $#words, pid $$\\n"')).toEqual(['string'])
    expect(classes(code, '$ENV')).toEqual(['variable'])
    expect(classes(code, '<<~EOT')).toEqual(['string'])
    expect(classes(code, '    Hello $name, "quoted" # not a comment\n    EOT')).toEqual(['string'])
    expect(classes(code, 'or die')).toEqual(['keyword', undefined, 'function'])
    expect(classes(code, '$!";')).toEqual(['string', undefined])
    expect(classes(code, '__END__\nData with "quotes" and s/x/y/\n')).toEqual(['comment'])
  })

  it('classifies sigil variables, special variables, and dereferences', () => {
    const code = 'my $n = $#array + $_ + $0 + $1 + $$; my ($e, $err) = ($@, $!); my @a = @{$ref}; my $s = ${name};\n' +
      'my %env = %ENV; my @args = @ARGV; my $pkg = $Foo::Bar::baz; my $v = $obj->{key}[0]{name}; &callback(\\&handler);'
    for (const name of ['$#array', '$_', '$0', '$1', '$$', '$@', '$!', '${name}', '%ENV', '@ARGV', '$Foo::Bar::baz', '&callback', '&handler']) {
      expect(classes(code, name), name).toEqual(['variable'])
    }
    expect(classes(code, '@{$ref}')).toEqual(['variable', undefined, 'variable', undefined])
    expect(classes(code, '$obj->{key}[0]{name}')).toEqual(['variable', 'operator', undefined, 'property', undefined, 'number', undefined, 'property', undefined])
    const deref = 'print $aref->$#*, $aref->@*, keys $href->%*, $+{name}, keys %+, $-[0], @-;\nprint "still code";'
    for (const name of ['$#*', '@*', '%*', '%+', '$-', '@-']) expect(classes(deref, name), name).toEqual(['variable'])
    expect(classes(deref, '$+{name}')).toEqual(['variable', undefined, 'property', undefined])
    expect(classes(deref, '"still code"')).toEqual(['string'])
  })

  it('keeps modulo and bitwise operators apart from hash and code sigils', () => {
    const code = 'my $m = $total % 7; my $p = ($x) % $y; my %copy = %h; my $b = $x & $y; if ($a && $b) { keys %$ref }'
    expect(classes(code, '$total % 7')).toEqual(['variable', undefined, 'operator', undefined, 'number'])
    expect(classes(code, ') % $y')).toEqual([undefined, 'operator', undefined, 'variable'])
    expect(classes(code, '%copy = %h')).toEqual(['variable', undefined, 'operator', undefined, 'variable'])
    expect(classes(code, '$x & $y')).toEqual(['variable', undefined, 'operator', undefined, 'variable'])
    expect(classes(code, '$a && $b')).toEqual(['variable', undefined, 'operator', undefined, 'variable'])
    expect(classes(code, '%$ref')).toEqual(['variable'])
    expect(classes('my %inv = map { $h{$_} => $_ } %h;', '%h;')).toEqual(['variable', undefined])
  })

  it('scans single, double, and backtick strings as one token', () => {
    const code = `my $a = 'it\\'s a \\\\ "#" $x'; my $b = "say \\"hi\\" # @{[ $x + 1 ]} \${y}"; my $c = \`ls -l # not\`;`
    expect(classes(code, `'it\\'s a \\\\ "#" $x'`)).toEqual(['string'])
    expect(classes(code, '"say \\"hi\\" # @{[ $x + 1 ]} ${y}"')).toEqual(['string'])
    expect(classes(code, '`ls -l # not`')).toEqual(['string'])
    expect(classes(code, '; my $c')).toEqual([undefined, 'keyword', undefined, 'variable'])
  })

  it('handles quote-like operators with any delimiter and nested brackets', () => {
    const code = 'my @l = (q(a (b) c), qq{x {$y} z}, qw/a b/, qr/^\\d+$/i, qx(ls));\n' +
      '$s =~ m/a.b/gi; $s =~ m{^/path}x; $s =~ m!x!; $s =~ s/a/b/g; $s =~ s{a}{b}g; $s =~ s{(\\w+)} {uc $1}ge;\n' +
      '$s =~ s|a|b|; $s =~ tr/a-z/A-Z/; $s =~ y/a/b/; $s =~ s#a#b#; print "done";'
    for (const text of ['q(a (b) c)', 'qq{x {$y} z}', 'qw/a b/', 'qr/^\\d+$/i', 'qx(ls)', 'm/a.b/gi', 'm{^/path}x', 'm!x!', 's/a/b/g', 's{a}{b}g', 's{(\\w+)} {uc $1}ge', 's|a|b|', 'tr/a-z/A-Z/', 'y/a/b/', 's#a#b#']) {
      expect(classes(code, text), text).toEqual(['string'])
    }
    expect(classes(code, 'print "done"')).toEqual(['function', undefined, 'string'])
  })

  it('does not open quote-like operators on keys, methods, names, or variables', () => {
    const code = 'print $h{s}, $h{q}, $h{ y }; $obj->s(1); $obj->q;\nsub m { 1 }\nmy %o = (s => 1, y => 2, tr => 3);\nprint $q; my $x = $y / 2; my $z = $q / 4; # end'
    expect(classes(code, '$h{s}')).toEqual(['variable', undefined, 'property', undefined])
    expect(classes(code, '$h{q}')).toEqual(['variable', undefined, 'property', undefined])
    expect(classes(code, '$obj->s(1)')).toEqual(['variable', 'operator', 'function', undefined, 'number', undefined])
    expect(classes(code, '$obj->q;')).toEqual(['variable', 'operator', 'function', undefined])
    expect(classes(code, 'sub m {')).toEqual(['keyword', undefined, 'function', undefined])
    expect(classes(code, 's => 1, y => 2, tr => 3')).toEqual(['property', undefined, 'operator', undefined, 'number', undefined, 'property', undefined, 'operator', undefined, 'number', undefined, 'property', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '$y / 2')).toEqual(['variable', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '$q / 4')).toEqual(['variable', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '# end')).toEqual(['comment'])
    const more = 'my %o = (m => 1, qw => 2); $x->{s}{y} = 1; my @a = (1) x 3;\nsub q { 1 } if (-s($file)) { my $avg = sum(@n) / @n; }\nmy $ok = 1;'
    expect(classes(more, 'm => 1, qw =>')).toEqual(['property', undefined, 'operator', undefined, 'number', undefined, 'property', undefined, 'operator'])
    expect(classes(more, '$x->{s}{y}')).toEqual(['variable', 'operator', undefined, 'property', undefined, 'property', undefined])
    expect(classes(more, ') x 3')).toEqual([undefined, 'keyword', undefined, 'number'])
    expect(classes(more, 'sub q {')).toEqual(['keyword', undefined, 'function', undefined])
    expect(classes(more, '-s($file)')).toEqual(['operator', 'function', undefined, 'variable', undefined])
    expect(classes(more, ') / @n')).toEqual([undefined, 'operator', undefined, 'variable'])
    expect(classes(more, '$ok')).toEqual(['variable'])
  })

  it('tells bare regexes from division and defined-or', () => {
    const code = 'if ($s =~ /a#b/ && $t !~ /c/) { return /x/ }\nmy @f = split //, $w; my @g = grep { !/^#/ } @l;\n' +
      'my $r = $a / $b / $c; my $u = ($x + 1) / 2; my $v = $h{k} / 3; my $w = $x // 5; $x //= 1; next unless /^\\s*$/;'
    expect(classes(code, '/a#b/')).toEqual(['string'])
    expect(classes(code, '/c/')).toEqual(['string'])
    expect(classes(code, '/x/')).toEqual(['string'])
    expect(classes(code, '//, $w')).toEqual(['string', undefined, 'variable'])
    expect(classes(code, '/^#/')).toEqual(['string'])
    expect(classes(code, '$a / $b / $c')).toEqual(['variable', undefined, 'operator', undefined, 'variable', undefined, 'operator', undefined, 'variable'])
    expect(classes(code, ') / 2')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, '} / 3')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(code, '$x // 5')).toEqual(['variable', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '//= 1')).toEqual(['operator', undefined, 'number'])
    expect(classes(code, '/^\\s*$/')).toEqual(['string'])
    const paths = '$p =~ s#/#::#g; $u =~ m#^/api#; my $m = time / 60; local $" = \', \'; my $s = "a$" . $\' . $h{\'k\'};\nprint "ok";'
    for (const text of ['s#/#::#g', 'm#^/api#', '\', \'', '"a$"', "'k'", '"ok"']) expect(classes(paths, text), text).toEqual(['string'])
    expect(classes(paths, 'time / 60')).toEqual([undefined, 'operator', undefined, 'number'])
    expect(classes(paths, '$" =')).toEqual(['variable', undefined, 'operator'])
    expect(classes(paths, "$' .")).toEqual(['variable', undefined, 'operator'])
  })

  it('never lets an unterminated slash regex span lines', () => {
    const code = 'my $half = time / 2;\nmy @x = (1, 2);\nprint "ok";'
    expect(classes(code, '@x')).toEqual(['variable'])
    expect(classes(code, '"ok"')).toEqual(['string'])
    const unclosed = 'my @p = split /,\nmy $n = 1;'
    expect(classes(unclosed, '$n')).toEqual(['variable'])
  })

  it('scans heredocs and keeps the opener line as code', () => {
    const code = 'print <<EOF . "x";\nbody "q # no\nEOF\nmy $s = <<"END";\n$name\nEND\nmy $r = <<\'RAW\';\n$not @interp\nRAW\nprint <<~TXT;\n    indented\n    TXT\nmy $n = 1 << 3; $n <<= 2; my $after = 1;'
    expect(classes(code, '<<EOF . "x";')).toEqual(['string', undefined, 'operator', undefined, 'string', undefined])
    expect(classes(code, 'body "q # no\nEOF')).toEqual(['string'])
    expect(classes(code, '<<"END"')).toEqual(['string'])
    expect(classes(code, '$name\nEND')).toEqual(['string'])
    expect(classes(code, '$not @interp\nRAW')).toEqual(['string'])
    expect(classes(code, '    indented\n    TXT')).toEqual(['string'])
    expect(classes(code, '1 << 3')).toEqual(['number', undefined, 'operator', undefined, 'number'])
    expect(classes(code, '<<= 2')).toEqual(['operator', undefined, 'number'])
    expect(classes(code, '$after')).toEqual(['variable'])
    const stacked = 'func(<<A, <<B);\na\nA\nb # x\nB\nprint $fh <<EOT;\n=head1 not pod\nEOT\nmy $t\n= 5;\nmy %k = (a\n=> 1);'
    expect(classes(stacked, 'a\nA')).toEqual(['string'])
    expect(classes(stacked, 'b # x\nB')).toEqual(['string'])
    expect(classes(stacked, '$fh <<EOT')).toEqual(['variable', undefined, 'string'])
    expect(classes(stacked, '=head1 not pod\nEOT')).toEqual(['string'])
    expect(classes(stacked, '= 5;')).toEqual(['operator', undefined, 'number', undefined])
    expect(classes(stacked, '=> 1')).toEqual(['operator', undefined, 'number'])
    // `<<~` terminators match horizontal indentation only (a `\s*` there went quadratic over blank lines).
    const blank = 'print <<~SQL;\n  SELECT 1\n\n\t  SQL\nmy $after = 1;\n' + 'print <<~X;\n' + '\n'.repeat(30000)
    expect(classes(blank, '  SELECT 1\n\n\t  SQL')).toEqual(['string'])
    expect(classes(blank, '$after')).toEqual(['variable'])
    const started = performance.now()
    highlighter.tokenize(blank, { lang: 'perl' })
    expect(performance.now() - started).toBeLessThan(1_000)
  })

  it('isolates comments, POD, and data sections', () => {
    const code = 'my $last = $#items; # comment with "quote" and s/x/\nmy @w = qw( a#b c );\n=pod\n\nmy $x = "hidden";\n\n=cut\nmy $y = 1;\n=head2 Unterminated\nstill pod'
    expect(classes(code, '$#items')).toEqual(['variable'])
    expect(classes(code, '# comment with "quote" and s/x/')).toEqual(['comment'])
    expect(classes(code, 'qw( a#b c )')).toEqual(['string'])
    expect(classes(code, '=pod\n\nmy $x = "hidden";\n\n=cut')).toEqual(['comment'])
    expect(classes(code, '$y')).toEqual(['variable'])
    expect(classes(code, '=head2 Unterminated\nstill pod')).toEqual(['comment'])
    expect(classes('my $x = 1;\n__DATA__\nraw "text"', '__DATA__\nraw "text"')).toEqual(['comment'])
    const inline = 'my %k = (__END__ => 1);\nmy $y = "__DATA__";\nprint "code";'
    expect(classes(inline, '__END__')).toEqual(['property'])
    expect(classes(inline, '"code"')).toEqual(['string'])
  })

  it('highlights keywords, literals, declarations, and numbers', () => {
    const code = 'use v5.36.0; use Data::Dumper; local $x = undef; print __PACKAGE__, __LINE__;\n' +
      'BEGIN { our $n = 1_000_000 + 0xFF + 0b1010 + 017 + 0o17 + 1.5e3 + .5 } if ($a eq $b or not $c) { last }\n' +
      'my $ok = $a <=> $b; $s .= "x" x 3; $x ||= 1; my @r = (1...3); my $ver = "1.2.3"; Foo::Bar->new; my $o = __PACKAGE__->new;'
    expect(classes(code, 'v5.36.0')).toEqual(['number'])
    expect(classes(code, 'Data::Dumper')).toEqual(['type'])
    expect(classes(code, 'local $x = undef')).toEqual(['keyword', undefined, 'variable', undefined, 'operator', undefined, 'literal'])
    expect(classes(code, '__PACKAGE__, __LINE__')).toEqual(['literal', undefined, 'literal'])
    expect(classes(code, 'BEGIN')).toEqual(['keyword'])
    for (const number of ['1_000_000', '0xFF', '0b1010', '017', '0o17', '1.5e3', '.5']) {
      expect(classes(code, number), number).toEqual(['number'])
    }
    expect(classes(code, '$a eq $b or not $c')).toEqual(['variable', undefined, 'keyword', undefined, 'variable', undefined, 'keyword', undefined, 'keyword', undefined, 'variable'])
    expect(classes(code, '<=>')).toEqual(['operator'])
    expect(classes(code, '.= "x" x 3')).toEqual(['operator', undefined, 'string', undefined, 'keyword', undefined, 'number'])
    expect(classes(code, '||=')).toEqual(['operator'])
    expect(classes(code, '1...3')).toEqual(['number', 'operator', 'number'])
    expect(classes(code, 'Foo::Bar->new')).toEqual(['type', 'operator', 'function'])
    expect(classes(code, '__PACKAGE__->new')).toEqual(['literal', 'operator', 'function'])
  })

  it('registers only the requested aliases', () => {
    expect(highlighter.normalizeLanguage('perl')).toBe('perl')
    expect(highlighter.normalizeLanguage('pl')).toBe('perl')
    expect(createHighlighter({ languages: [] }).normalizeLanguage('perl')).toBe('plaintext')
  })
})
